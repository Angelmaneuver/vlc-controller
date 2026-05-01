use tauri::{AppHandle, LogicalSize, Manager, PhysicalSize, Size, WebviewWindow};

pub fn get_main_window(app: AppHandle) -> WebviewWindow {
    return app
        .get_webview_window("main")
        .expect("error while get main window");
}

pub fn get_current_size(window: &WebviewWindow) -> PhysicalSize<u32> {
    return window.inner_size().unwrap();
}

pub fn set_window_size(window: &WebviewWindow, width: Option<f64>, height: Option<f64>) {
    let current = get_current_size(window).to_logical(window.scale_factor().unwrap());

    window
        .set_size(Size::Logical(LogicalSize {
            width: width.unwrap_or(current.width),
            height: height.unwrap_or(current.height),
        }))
        .expect("error while set window size");
}

pub fn set_available_size(
    window: &WebviewWindow,
    min_width: Option<f64>,
    max_width: Option<f64>,
    min_height: Option<f64>,
    max_height: Option<f64>,
) {
    if min_width.is_some() || min_height.is_none() {
        window
            .set_min_size(Some(LogicalSize {
                width: min_width.unwrap_or(0.0),
                height: min_height.unwrap_or(0.0),
            }))
            .expect("error while set minimum window size");
    }

    if max_width.is_some() || max_height.is_some() {
        window
            .set_max_size(Some(LogicalSize {
                width: max_width.unwrap_or(0.0),
                height: max_height.unwrap_or(0.0),
            }))
            .expect("error while set maximum window size");
    }
}

#[tauri::command]
pub fn change_by_combobox(app: AppHandle, expand: bool) -> () {
    let window = get_main_window(app.clone());
    let width: Option<f64> = Some(420.);
    let height: Option<f64>;

    if expand {
        height = Some(350.);
    } else {
        height = Some(39.59);
    }

    set_window_size(&window, width, height);
    set_available_size(&window, width, width, height, height);
}

#[tauri::command]
pub fn exit(app: AppHandle) {
    #[cfg(target_os = "macos")]
    {
        app.hide().unwrap();
    }
    #[cfg(not(target_os = "macos"))]
    {
        app.exit(0);
    }
}
