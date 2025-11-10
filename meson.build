project('my-first-extension', 'c',
  version: '1',
  meson_version: '>= 0.48.0'
)

gnome = import('gnome')
pkg = import('pkgconfig')

pkg.generate(
  name: meson.project_name(),
  filebase: meson.project_name(),
  description: 'A cool extension.',
  version: meson.project_version()
)

schemadir = get_option('prefix') / get_option('datadir') / 'glib-2.0' / 'schemas'
extensiondir = get_option('prefix') / get_option('datadir') / 'gnome-shell' / 'extensions' / 'wallpaper-changer@lirik00199'

gnome.compile_schemas(
  build_by_default: true,
  depend_files: 'schemas/org.gnome.shell.extensions.my-first-extension.gschema.xml'
)

install_data(
  'extension.js',
  'prefs.js',
  'metadata.json',
  install_dir: extensiondir
)

install_data(
  'schemas/org.gnome.shell.extensions.my-first-extension.gschema.xml',
  install_dir: schemadir
)
