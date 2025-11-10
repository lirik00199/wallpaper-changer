import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MyExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: _('General Settings'),
        });
        page.add(group);

        // --- Update Interval ---
        const intervalRow = new Adw.ActionRow({
            title: _('Update Interval (seconds)'),
        });
        group.add(intervalRow);

        const intervalSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                value: settings.get_int('update-interval'),
                lower: 5,
                upper: 3600,
                step_increment: 1,
            }),
            valign: Gtk.Align.CENTER,
        });
        intervalRow.add_suffix(intervalSpinButton);
        intervalRow.activatable_widget = intervalSpinButton;
        settings.bind(
            'update-interval',
            intervalSpinButton.get_adjustment(),
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        // --- Wallpaper Folder ---
        const folderRow = new Adw.ActionRow({
            title: _('Wallpaper Folder'),
        });
        group.add(folderRow);

        const defaultPictures = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES);
        const folderChooser = new Gtk.FileChooserNative({
            title: _('Select Wallpaper Folder'),
            action: Gtk.FileChooserAction.SELECT_FOLDER,
            transient_for: window.get_root(),
            modal: true,
        });

        const folderLabel = new Gtk.Label({
            halign: Gtk.Align.START,
            valign: Gtk.Align.CENTER,
            ellipsize: Pango.EllipsizeMode.END,
        });

        const folderButton = new Gtk.Button({
            child: folderLabel,
            valign: Gtk.Align.CENTER,
        });

        folderButton.connect('clicked', () => {
            folderChooser.show();
        });

        folderChooser.connect('response', (dialog, response) => {
            if (response === Gtk.ResponseType.ACCEPT) {
                const file = dialog.get_file();
                if (file) {
                    const path = file.get_path();
                    settings.set_string('wallpaper-folder', path);
                    folderLabel.set_text(path);
                }
            }
        });
        
        let currentFolder = settings.get_string('wallpaper-folder');
        if (currentFolder === '') {
            folderLabel.set_text(defaultPictures);
            settings.set_string('wallpaper-folder', defaultPictures);
        } else {
            folderLabel.set_text(currentFolder);
        }

        folderRow.add_suffix(folderButton);
        folderRow.activatable_widget = folderButton;

        window.add(page);
    }
}
