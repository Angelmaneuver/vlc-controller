use base64::Engine;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::sync::OnceLock;

pub struct Config {
    pub url: String,
    pub password: String,
}

pub static CONFIG: OnceLock<Config> = OnceLock::new();

#[derive(Debug, Serialize, Deserialize, Clone)]
struct VlcPlaylist {
    #[serde(rename = "node")]
    pub node: Option<Vec<Node>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Node {
    #[serde(rename = "id")]
    pub id: Option<String>,
    #[serde(rename = "name")]
    pub name: Option<String>,
    #[serde(rename = "type")]
    pub node_type: Option<String>,
    #[serde(rename = "node", default)]
    pub nodes: Vec<Node>,
    #[serde(rename = "leaf", default)]
    pub leaves: Vec<Leaf>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Leaf {
    #[serde(rename = "id")]
    pub id: Option<String>,
    #[serde(rename = "name")]
    pub name: Option<String>,
    #[serde(rename = "current")]
    pub current: Option<String>,
    #[serde(rename = "duration")]
    pub duration: Option<String>,
    #[serde(rename = "uri", default)]
    pub uri: Option<String>,
    #[serde(rename = "info", default)]
    pub info: Vec<Info>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Info {
    #[serde(rename = "name")]
    pub name: Option<String>,
    #[serde(rename = "$value")]
    pub value: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VlcStatus {
    pub fullscreen: Option<String>,
    pub volume: Option<String>,
    pub state: Option<String>,
    pub position: Option<String>,
    pub time: Option<String>,
    pub length: Option<String>,
    pub information: Option<Information>,
    pub stats: Option<Stats>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Information {
    #[serde(rename = "category", default)]
    pub categories: Vec<Category>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    #[serde(rename = "@name")]
    pub name: Option<String>,
    #[serde(rename = "info", default)]
    pub infos: Vec<Info>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Stats {
    pub playedcount: Option<String>,
    pub lostabuffers: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Channel {
    pub id: Option<String>,
    pub name: Option<String>,
    pub current: bool,
    pub duration: Option<String>,
    pub uri: Option<String>,
}

impl From<VlcPlaylist> for Vec<Channel> {
    fn from(playlist: VlcPlaylist) -> Self {
        let mut channels: Vec<Channel> = Vec::new();

        if playlist.node.is_none() {
            return channels;
        }

        for node in playlist.node.unwrap() {
            channels.extend(Vec::from(node));
        }

        return channels;
    }
}

impl From<Node> for Vec<Channel> {
    fn from(node: Node) -> Self {
        let mut channels: Vec<Channel> = Vec::new();

        for leaf in node.leaves {
            let current = leaf.current.unwrap_or("".to_string());

            channels.push(Channel {
                id: leaf.id,
                name: leaf.name,
                current: current.eq("current"),
                duration: leaf.duration,
                uri: leaf.uri,
            });
        }

        for children in node.nodes {
            channels.extend(Vec::from(children));
        }

        return channels;
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Status {
    pub volume: u16,
    pub state: String,
}

impl From<VlcStatus> for Status {
    fn from(vlc_status: VlcStatus) -> Self {
        let volume = vlc_status
            .volume
            .unwrap_or("128".to_string())
            .parse::<u16>()
            .unwrap_or(128);

        let state = match &*vlc_status.state.unwrap_or("stopped".to_string()) {
            "playing" => "playing".to_string(),
            "stopped" => "stopped".to_string(),
            _ => "stopped".to_string(),
        };

        return Status { volume, state };
    }
}

fn url() -> String {
    return CONFIG.get().unwrap().url.clone();
}

fn auth_header() -> String {
    let password = &CONFIG.get().unwrap().password;

    let credentials = format!(":{}", password);
    let encoded = base64::engine::general_purpose::STANDARD.encode(&credentials);
    let auth_header = format!("Basic {}", encoded);

    return auth_header;
}

async fn get<T: DeserializeOwned>(url: &str) -> Result<T, String> {
    let auth_header = auth_header();

    let client = reqwest::Client::new();

    let response = client
        .get(url)
        .header("Authorization", auth_header)
        .send()
        .await
        .map_err(|e| format!("リクエスト失敗: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "HTTPエラー: {} {}",
            response.status().as_u16(),
            response.status().canonical_reason().unwrap_or("Unknown")
        ));
    }

    let xml_data = response
        .text()
        .await
        .map_err(|e| format!("テキスト取得失敗: {}", e))?;

    let parsed: T =
        serde_xml_rs::from_str(&xml_data).map_err(|e| format!("XMLパース失敗: {}", e))?;

    Ok(parsed)
}

async fn request(url: &str) -> Result<(), String> {
    let auth_header = auth_header();

    let client = reqwest::Client::new();

    client
        .get(url)
        .header("Authorization", auth_header)
        .send()
        .await
        .map_err(|e| format!("リクエスト失敗: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn channel() -> Result<Vec<Channel>, String> {
    let url = &format!("{}/requests/playlist.xml", url());
    let playlist = get::<VlcPlaylist>(url).await?;

    Ok(Vec::from(playlist))
}

#[tauri::command]
pub async fn status() -> Result<Status, String> {
    let url = &format!("{}/requests/status.xml", url());
    let status = get::<VlcStatus>(url).await?;

    Ok(Status::from(status))
}

#[tauri::command]
pub async fn select(id: &str) -> Result<(), String> {
    let url = &format!("{}/requests/status.xml?command=pl_play&id={}", url(), id);
    request(url).await?;

    Ok(())
}

#[tauri::command]
pub async fn stop() -> Result<(), String> {
    let url = &format!("{}/requests/status.xml?command=pl_stop", url());
    request(url).await?;

    Ok(())
}

#[tauri::command]
pub async fn volume(value: u16) -> Result<(), String> {
    let url = &format!("{}/requests/status.xml?command=volume&val={}", url(), value);
    request(url).await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn channel() {
        match super::channel().await {
            Ok(data) => {
                println!();
                println!("チャンネル数={}", data.len());

                for channel in data {
                    println!();

                    println!(
                        "チャンネル={} ({})",
                        channel.name.unwrap_or_default(),
                        channel.id.unwrap_or_default()
                    );
                    println!("選曲中={}", channel.current);
                    println!("期間={}", channel.duration.unwrap_or_default());
                    println!("uri={}", channel.uri.unwrap_or_default());
                }

                println!();
            }
            Err(e) => eprintln!("{}", e),
        }
    }

    #[tokio::test]
    async fn status() {
        match super::status().await {
            Ok(data) => {
                println!();
                println!("状態={}, 音量={}", data.state, data.volume);
            }
            Err(e) => eprintln!("{}", e),
        }
    }
}
