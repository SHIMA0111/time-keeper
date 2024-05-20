use tokio_postgres::{Client, NoTls, Error as PGError};

pub struct DBConnection {
    client: Client
}

impl <'a> DBConnection {
    pub async fn new() -> Result<Self, PGError> {
        let (client, connection) = tokio_postgres::Config::new()
            .user("app")
            .password("password")
            .host("127.0.0.1")
            .port(5432)
            .dbname("postgres")
            .connect(NoTls).await?;

        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("Connection Failed: {}", e);
            }
        });
        Ok(Self {
            client
        })
    }

    pub fn client(&'a self) -> &'a Client {
        &self.client
    }
}
