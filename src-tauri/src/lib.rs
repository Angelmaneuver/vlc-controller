use tauri::Emitter;
use tauri_plugin_cli::CliExt;

mod vlc;
mod window;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_cli::init())
        .setup(|app| {
            match app.cli().matches() {
                Ok(matches) => {
                    dbg!("{:?}", &matches);

                    let url = matches
                        .args
                        .get("url")
                        .clone()
                        .unwrap()
                        .value
                        .as_str()
                        .expect("while error retrieve startup arguments");
                    dbg!("{:?}", url);

                    let password = matches
                        .args
                        .get("password")
                        .clone()
                        .unwrap()
                        .value
                        .as_str()
                        .expect("while error retrieve startup arguments");
                    dbg!("{:?}", password);

                    vlc::CONFIG.get_or_init(|| vlc::Config {
                        url: url.to_string(),
                        password: password.to_string(),
                    });
                }
                Err(_) => {}
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            window::change_by_combobox,
            window::exit,
            vlc::channel,
            vlc::status,
            vlc::select,
            vlc::stop,
            vlc::volume
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
