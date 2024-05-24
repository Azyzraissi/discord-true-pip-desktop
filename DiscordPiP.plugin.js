/**
 * @name True Picture-in-Picture
 * @description Enables true Picture-in-Picture mode for videos when the Discord app is out of focus.
 * @version 1.1
 * @autor Aziz Raissi Darouez
 * @authorId 285876865594425345
 * @authorLink https://www.threads.net/@azyz.raw
 * @website https://github.com/Azyzraissi
 * @source https://github.com/Azyzraissi/discord-true-pip-desktop
 */

class DiscordPiP {
    start() {
        this.enablePictureInPicture();
    }

    stop() {
        this.cleanup();
    }

    enablePictureInPicture() {
        if (!document.pictureInPictureEnabled) {
            console.error('Picture-in-Picture is not supported in this browser.');
            return;
        }

        let pipActive = false;

        const enterPiP = async (video) => {
            if (!pipActive && !video.paused && !video.ended) {
                try {
                    await video.requestPictureInPicture();
                    pipActive = true;
                } catch (error) {
                    console.error('Error entering Picture-in-Picture mode:', error);
                }
            }
        };

        const exitPiP = async () => {
            if (pipActive) {
                try {
                    await document.exitPictureInPicture();
                    pipActive = false;
                } catch (error) {
                    console.error('Error exiting Picture-in-Picture mode:', error);
                }
            }
        };

        const checkAndEnterPiP = () => {
            const videoElements = document.getElementsByTagName('video');
            Array.from(videoElements).forEach(video => {
                if (!pipActive && !video.paused && !video.ended) {
                    enterPiP(video);
                }
            });
        };

        const monitorVideos = () => {
            const videoElements = document.getElementsByTagName('video');
            Array.from(videoElements).forEach(video => {
                video.addEventListener('pause', exitPiP);
                video.addEventListener('ended', exitPiP);
                video.addEventListener('enterpictureinpicture', (event) => {
                    if (pipActive && event.target !== document.pictureInPictureElement) {
                        exitPiP();
                    }
                });
                video.addEventListener('leavepictureinpicture', () => {
                    pipActive = false;
                });
                video.addEventListener('emptied', exitPiP);
                video.addEventListener('abort', exitPiP);
                video.addEventListener('error', exitPiP);
            });
        };

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                checkAndEnterPiP();
            }
        });

        window.addEventListener('blur', checkAndEnterPiP);
        window.addEventListener('focus', () => {
            // Do not exit PiP on focus
        });

        const observer = new MutationObserver(() => {
            monitorVideos();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        monitorVideos();

        this.observer = observer;
        this.exitPiP = exitPiP;
        this.checkAndEnterPiP = checkAndEnterPiP;
    }

    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
        window.removeEventListener('blur', this.checkAndEnterPiP);
        document.removeEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.checkAndEnterPiP();
            }
        });
    }
}

module.exports = DiscordPiP;