(function(App) {
    "use strict";

    var streamModel = null; 
    var fleexVideoId = null;

    var readTorrent = require('read-torrent');
    var torrentStream = require('torrent-stream');
    var osTorrentHash = require('os-torrent-hash');
    var Q = require('q');

    var baseUrl = Settings.fleexApiEndpoint;


    /**
     * Convert a buffer to an array buffer
    **/
    function toArrayBuffer(buffer) {
        var ab = new window.ArrayBuffer(buffer.length);
        var view = new window.Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer.readUInt8(i);
        }
        return ab;
    }

     /**
     * For every subtitles in the submitted array that needs it, 
     * downloads the underlying file using its 'Url' property 
     * and saves the resulting string into an 'AsBlob' property.
    **/
    function downloadSubs (subsArray, callback) {
        var downloadFailures = [];

        // This part will be called after we've tried to download all subtitles
        var finishIfAllDownloaded = _.after(subsArray.length, function(){
            // Filter out subs that failed to download
            var downloadedSubs = _.filter(subsArray, function(sub){
                return downloadFailures.indexOf(sub.subtitlesId) == -1;
            })
            // Fire callback
            if(typeof callback === 'function'){ return callback(downloadedSubs); }
        })

        if(subsArray.length == 0){
            return callback([]);
        }

        for (var i = subsArray.length - 1; i >= 0; i--) {
            var subs = subsArray[i];

            // Only download subs if it needs it
            if(subs.mustBeDownloaded && subs.downloadUrl){
                // We use a closure here
                request({url : subs.downloadUrl, encoding: null}, (function(_subs){ 
                    return function (error, response, body) {
                        // Subtitles was downloaded successfully - store it
                        if (!error && response.statusCode == 200) {
                            _subs.asBlob = new window.Blob([toArrayBuffer(body)]);
                        }
                        // Subtitles download failed. Remove from subs array. 
                        // TODO: Log warning server-side?
                        else {
                            downloadFailures.push(_subs.subtitleId);
                        }
                        finishIfAllDownloaded();
                    };
                })(subs));
            } else { finishIfAllDownloaded(); }
        };
    }

    /**
     * For every subtitles in the submitted array that need it, uploads 
     * the underlying subtitles content to fleex's server using the 
     * 'AsString' property. If parsing fails or an error occurs serverside, 
     * corresponding subs is removed from result array
    **/
    function uploadSubs (subsArray, callback) {
        // Collect data to upload
        var data = new window.FormData();
        for (var i = 0; i < subsArray.length; i++) {
            var subs = subsArray[i];

            // Only upload subs if it needs it
            if(subs.asBlob){
                data.append(subs.subtitleId.toString(), subs.asBlob, subs.subFileName);
            }
        }

        var url = baseUrl + "Subtitles/UploadSubtitles";
        $.ajax({
            type : 'POST',
            url : url,
            data : data,
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false,
            processData: false
        }).complete(function(){
            if(typeof callback === 'function'){ return callback(); }
        });
    }

    /**
     * Submit a video to fleex's server. The server will:
     *    - Get or create the video, videoEntry / episode, tvShow (if applicable)
     *    - Find subtitles to download for the video
     *    - return the videoId and the subtitles to download
    **/
    var fleexVideo = function(data){
        var url = baseUrl + "Popcorn/GetSubtitlesToDownload";
        $.ajax({
            'type':'POST',
            'url': url,
            'data':{
                movieHash : data.movieHash,
                imdbId: data.imdbId,
                title: data.title,
                description: data.description,
                showTvdbId: data.tvdbId,
                episodeIndex: data.episodeIndex,
                seasonIndex: data.seasonIndex,
                showTitle: data.showTitle,
                showDescription: data.showDescription,
                nativeLanguageCode : data.nativeLanguageCode,
                targetLanguageCode : data.targetLanguageCode,
                fileSize : data.fileSize,
                fileName : data.fileName,
                maxNbOfSubsPerLanguage : 5
            },
            'error':function(err){
                App.vent.trigger('error', err);
            },
            'success':function(res){
                // retrieve videoId
                fleexVideoId = res.videoId;
                console.log('Preparing subtitles for fleex video #%d', fleexVideoId);

                // Some subtitles may not be stored server-side (server can't download subs due to
                // OpenSubtitles's dl limitations): have the client download them and send the result
                var subsToDownload = res.subsToDownload;

                // Download subtitles that need downloading
                // Subtitles that fail downloading succesfully are removed in the process
                downloadSubs(subsToDownload, function(downloadedSubs){
                        // When all subs have been downloaded, upload them to server
                        // Subtitles that fail to parse server-side are removed in the process
                        uploadSubs(downloadedSubs, function(){
                            console.log('Successfully prepared subtitles for fleex playback');
                            data.stateModel.set('fleexed', true);
                            App.vent.trigger('fleexer:ready');
                        });
                    }
                );
            }
        });
    }

    var Fleexer = {
        fleexVideo: function(stateModel) {
            fleexVideoId = null;
            streamModel = null;

            // Get imdb id and video title / description if we have it
            var imdbId = stateModel.get('torrentInfo').get('imdbid') || 0;
            var title = stateModel.get('torrentInfo').get('name');
            var description = stateModel.get('torrentInfo').get('description');

            // Get episode info if we have it
            var tvdbId = parseInt(stateModel.get('torrentInfo').get('tvdb_id')) || 0;
            var showTitle = stateModel.get('torrentInfo').get('show_title');
            var showDescription = stateModel.get('torrentInfo').get('show_description');
            var episodeIndex = parseInt(stateModel.get('torrentInfo').get('episode')) || 0;
            var seasonIndex = parseInt(stateModel.get('torrentInfo').get('season')) || 0;
            
            // Show that we're loading the video for the player
            App.vent.trigger('player:loading', stateModel);

            // If cancel button is hit, cancel everything
            App.vent.on('stream:stop', function(){
                streamModel = null;
                fleexVideoId = null;
            })

            // Compute the OS hash for the torrent
            var torrentUrl = stateModel.get('torrentInfo').get('torrent');
            var computingHash = osTorrentHash.computeHash(torrentUrl, stateModel.get('streamInfo').get('engine'));
            Q.when(computingHash).then(function(res){
                // Log result and 'fleex' the video
                console.log('Computed movie hash %s, with file size %d and file name %s', res.movieHash, res.fileSize, res.fileName);
                fleexVideo({
                    fileSize: res.fileSize, 
                    movieHash: res.movieHash,
                    fileName: res.fileName,
                    imdbId: imdbId,
                    title: title,
                    description: description,
                    tvdbId: tvdbId,
                    showTitle: showTitle,
                    showDescription: showDescription,
                    episodeIndex: episodeIndex,
                    seasonIndex: seasonIndex,
                    targetLanguageCode: 'eng',
                    nativeLanguageCode: App.fleexUser.get('nativeLanguageCode'),
                    stateModel: stateModel
                })
            })
        }
    };

    App.vent.on('stream:started', Fleexer.fleexVideo);

})(window.App);