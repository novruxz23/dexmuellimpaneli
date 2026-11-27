// DeX Müəllim Paneli — masaüstü tətbiq.
//
// Bu, dexmuellimpaneli.vercel.app ünvanındakı müəllim panelini ayrıca bir pəncərədə
// açan çox kiçik bir Tauri qabığıdır (başqa heç nə etmir: bütün məntiq saytın
// özündədir). Default ünvan tauri.conf.json-dadır; məktəb öz serverini işlədirsə,
// proqramın yanına (və ya onun qovluğuna) qoyulan `dex-config.json` faylındakı
// `siteUrl` açılışda onu əvəz edir — DeX-in Windows tətbiqindəki eyni qaydadır
// (bax: app/windows/src-tauri/src/site.rs, `config_url`).

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use tauri::{Manager, Url};

/// `dex-config.json`-da `{"siteUrl": "https://..."}} olarsa, panel pəncərəsi default
/// ünvan yerinə onu açır. Fayl yoxdursa və ya düzgün deyilsə, heç nə dəyişmir.
fn configured_url() -> Option<Url> {
    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            candidates.push(dir.join("dex-config.json"));
        }
    }
    if let Some(dir) = dirs_local_config() {
        candidates.push(dir.join("DeX").join("panel-config.json"));
    }
    for path in candidates {
        let Ok(text) = std::fs::read_to_string(&path) else { continue };
        let Ok(value) = serde_json::from_str::<serde_json::Value>(text.trim_start_matches('\u{feff}')) else { continue };
        let Some(raw) = value.get("siteUrl").and_then(|v| v.as_str()) else { continue };
        let trimmed = raw.trim().trim_end_matches('/');
        if !(trimmed.starts_with("http://") || trimmed.starts_with("https://")) {
            continue;
        }
        if let Ok(mut url) = Url::parse(trimmed) {
            // the panel always lives at /panel on the class server
            if !url.path().trim_matches('/').eq_ignore_ascii_case("panel") {
                url.set_path("/panel");
            }
            return Some(url);
        }
    }
    None
}

/// `%LOCALAPPDATA%` on Windows, `$XDG_CONFIG_HOME` (or `~/.config`) elsewhere —
/// without adding a dependency just for this one lookup.
fn dirs_local_config() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        std::env::var_os("LOCALAPPDATA").map(PathBuf::from)
    }
    #[cfg(not(windows))]
    {
        if let Some(p) = std::env::var_os("XDG_CONFIG_HOME") {
            return Some(PathBuf::from(p));
        }
        std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".config"))
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // A second launch just brings the existing window forward.
            if let Some(win) = app.get_webview_window("panel") {
                let _ = win.show();
                let _ = win.unminimize();
                let _ = win.set_focus();
            }
        }))
        .setup(|app| {
            if let Some(url) = configured_url() {
                if let Some(win) = app.get_webview_window("panel") {
                    let _ = win.navigate(url);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the DeX panel app");
}
