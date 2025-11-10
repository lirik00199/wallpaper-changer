import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png'];

export default class WallpaperChangerExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._timeout = null;
        this._wallpaperFolder = null;
        this._wallpapers = [];
        this._currentIndex = 0;
        this._settings = null;
        this._backgroundSettings = null;
    }

    enable() {
        this._settings = this.getSettings();
        this._backgroundSettings = new Gio.Settings({ schema: 'org.gnome.desktop.background' });
        
        this._settings.connect('changed::update-interval', () => this._resetTimer());
        this._settings.connect('changed::wallpaper-folder', () => this._loadWallpapers());

        this._loadWallpapers();
    }

    disable() {
        this._stopTimer();
        if (this._settings) {
            this._settings.disconnect();
            this._settings = null;
        }
        this._backgroundSettings = null;
        this._wallpapers = [];
    }

    _loadWallpapers() {
        this._wallpaperFolder = this._settings.get_string('wallpaper-folder');
        if (!this._wallpaperFolder || !GLib.file_test(this._wallpaperFolder, GLib.FileTest.IS_DIR)) {
            let picturesDir = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES);
            this._settings.set_string('wallpaper-folder', picturesDir);
            this._wallpaperFolder = picturesDir;
        }
        
        this._wallpapers = [];
        let dir = Gio.File.new_for_path(this._wallpaperFolder);
        if (!dir) return;

        let enumerator = dir.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
        let fileInfo;
        while ((fileInfo = enumerator.next_file(null)) !== null) {
            let fileName = fileInfo.get_name();
            let extension = fileName.split('.').pop().toLowerCase();
            if (VALID_EXTENSIONS.includes(extension)) {
                this._wallpapers.push(fileName);
            }
        }
        this._wallpapers.sort();
        this._currentIndex = 0;

        if (this._wallpapers.length > 0) {
            this._changeWallpaper();
            this._resetTimer();
        } else {
            log(_('No wallpapers found in the selected folder.'));
        }
    }
    
    _changeWallpaper() {
        if (this._wallpapers.length === 0) return;

        const wallpaperPath = GLib.build_filenamev([this._wallpaperFolder, this._wallpapers[this._currentIndex]]);
        const wallpaperUri = GLib.filename_to_uri(wallpaperPath, null);
        
        this._backgroundSettings.set_string('picture-uri', wallpaperUri);
        this._backgroundSettings.set_string('picture-uri-dark', wallpaperUri);

        this._currentIndex = (this._currentIndex + 1) % this._wallpapers.length;
    }

    _resetTimer() {
        this._stopTimer();
        const interval = this._settings.get_int('update-interval');
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
            this._changeWallpaper();
            return GLib.SOURCE_CONTINUE; // Keep timer running
        });
    }

    _stopTimer() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
    }
}
