//META{"name":"DiscordPiP","source":"https://github.com/Azyzraissi/discord-true-pip-desktop","version":"1.0","description":"Enables Picture-in-Picture mode for videos on Discord web pages when the Discord app is out of focus.","author":"Aziz Raissi Darouez","icon":"URL_TO_YOUR_ICON_IMAGE"}*//
var DiscordPiP = class DiscordPiP {
    start() {
        this.enablePictureInPicture();
    }

    stop() {
        this.cleanup();
    }

    enablePictureInPicture() {
        const videoElements = document.getElementsByTagName('video');
        let pipActive = false; // Track if PiP mode is currently active

        if (!document.pictureInPictureEnabled) {
            console.error('Picture-in-Picture is not supported in this browser.');
            return;
        }

        const enterPiP = async (video) => {
            if (pipActive) return;
            try {
                await video.requestPictureInPicture();
                pipActive = true;
            } catch (error) {
                if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                    console.error('Error entering Picture-in-Picture mode:', error);
                }
            }
        };

        const exitPiP = async () => {
            if (!pipActive) return;
            try {
                await document.exitPictureInPicture();
                pipActive = false;
            } catch (error) {
                console.error('Error exiting Picture-in-Picture mode:', error);
            }
        };

        const checkAndEnterPiP = () => {
            Array.from(videoElements).forEach(video => {
                if (!pipActive && !video.paused && !video.ended) {
                    enterPiP(video);
                }
            });
        };

        const handleUserAction = () => {
            exitPiP();
        };

        // Event listener for focus change
        window.addEventListener('blur', checkAndEnterPiP);

        // Event listener for exiting PiP mode using the "Back to tab" button
        document.addEventListener('leavepictureinpicture', () => {
            pipActive = false;
        });

        // Event listeners for user actions to exit PiP
        document.addEventListener('click', handleUserAction);
        document.addEventListener('input', handleUserAction);
        document.addEventListener('keydown', handleUserAction);

        // Initial check
        if (!document.hasFocus()) {
            checkAndEnterPiP();
        }

        // Store elements and handlers for cleanup
        this.checkAndEnterPiP = checkAndEnterPiP;
        this.leavePiPHandler = handleUserAction;
        this.handleUserAction = handleUserAction;
    }

    cleanup() {
        window.removeEventListener('blur', this.checkAndEnterPiP);
        document.removeEventListener('leavepictureinpicture', this.leavePiPHandler);
        document.removeEventListener('click', this.handleUserAction);
        document.removeEventListener('input', this.handleUserAction);
        document.removeEventListener('keydown', this.handleUserAction);
    }
};

module.exports = DiscordPiP;