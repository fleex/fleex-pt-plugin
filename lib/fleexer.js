//# sourceURL=fleexer.js

(function(App) {
    'use strict';

    var streamModel = null;
    var stateModel = null;

    // Modules available in PT main 
    var readTorrent = require('read-torrent');
    var Q = require('q');
    var request = require('request');

    // plugin-specific modules
    var torrentStream = require('../plugins/pt-fleex-plugin/node_modules/torrent-stream/index.js');
    var osTorrentHash = require('../plugins/pt-fleex-plugin/node_modules/os-torrent-hash/index.js');


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
                return downloadFailures.indexOf(sub.subtitlesId) === -1;
            });
            // Fire callback
            if(typeof callback === 'function'){ return callback(downloadedSubs); }
        });

        if(subsArray.length === 0){
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
                        if (!error && response.statusCode === 200) {
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
        }
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

        var url = Settings.fleexApiEndpoint + 'Subtitles/UploadSubtitles';
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
        var url = Settings.fleexApiEndpoint + 'Popcorn/GetSubtitlesToDownload';
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
                var fleexVideoId = res.videoId;
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
                        var fleexUrl = Settings.fleexApiEndpoint + 'Popcorn/Play?videoId=' + fleexVideoId + '&port=' + stateModel.get('streamInfo').get('engine').server.address().port;
                        App.vent.trigger('fleexer:ready', fleexUrl);
                    });
                });
            }
        });
    };

    var Fleexer = {
        cacheStreamModel: function(model){
            streamModel = model;
        },
        cacheStateModel: function(model){
            stateModel = model;
        },
        resetModels: function(){
            streamModel = null;
            stateModel = null;
        },
        fleexVideo: function() {
            if(streamModel && stateModel.get('streamInfo')){
                // Get imdb id and video title / description if we have it
                var imdbId = streamModel.get('imdbid') || 0;
                var title = streamModel.get('name');
                var description = streamModel.get('description');

                // Get episode info if we have it
                var tvdbId = parseInt(streamModel.get('tvdb_id')) || 0;
                var showTitle = streamModel.get('show_title');
                var showDescription = streamModel.get('show_description');
                var episodeIndex = parseInt(streamModel.get('episode')) || 0;
                var seasonIndex = parseInt(streamModel.get('season')) || 0;

                // Compute the OS hash for the torrent
                var torrentUrl = streamModel.get('torrent');
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
                    });
                });
            } else {
                setTimeout(Fleexer.fleexVideo, 1000);
            }
        }
    };

    App.vent.on('stream:stop', Fleexer.resetModels);
    App.vent.on('stream:start', Fleexer.cacheStreamModel);
    App.vent.on('stream:started', Fleexer.cacheStateModel);
    App.vent.on('stream:started', Fleexer.fleexVideo);

})(window.App);