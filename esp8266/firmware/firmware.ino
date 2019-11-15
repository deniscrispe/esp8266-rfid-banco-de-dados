// LIBRARYS
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFiManager.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
//#include <WiFiUdp.h>
#include <ArduinoOTA.h>

// DEFINES
#define RST_PIN 5
#define SS_PIN 4

// VARIABLES
const char* SSID = "Denis_Davi"; // rede wifi
const char* PASSWORD = "dade252629"; // senha da rede wifi

const char* BROKER_MQTT = "broker.hivemq.com"; // ip/host do broker
int BROKER_PORT = 1883; // porta do broker

const char* TOPIC_PING = "/smartaccess/denis/catraca/entrada/ping";

const char* TOPIC_PONG = "/smartaccess/denis/catraca/entrada/pong";

const char* TOPIC_WRITE = "/smartaccess/denis/catraca/write";

const String SALA = "1";
String msgEscrita ="teste";


// WIFI Manager
const char* myHostnameManager = "Denis-ViniciusEsp"; // Nome do host na rede
const char* SSIDManager = "Denis-Vinicius-Manager"; // SSID / nome da rede WI-FI (AP) do WiFiManager 
const char* PASSWORDManager = "denis123"; // Senha da rede WI-FI (AP) do WiFiManager

// PROTOTYPES
void initPins();
void initSerial();
void initRfid();
void init_WifiAp();
void initOTA();
void initMQTT();
void escreve();
void VerificaConexoesWiFIEMQTT(void);
void reconnectWiFi();
void InitOutput(void);

// OBJECTS
WiFiClient client; // Cria o objeto espClient
PubSubClient MQTT(client); // Instancia o Cliente MQTT passando o objeto espClient
MFRC522 mfrc522(SS_PIN, RST_PIN); // instancia o rfid

// setup
void setup() {
  initSerial();
  init_WifiAp();
  initOTA();
  initMQTT();
  initRfid();
  InitOutput();

}

void loop() {
  
  // keep-alive da comunicação OTA
    ArduinoOTA.handle();

  //garante funcionamento das conexões WiFi e ao broker MQTT
  VerificaConexoesWiFIEMQTT();
  
  MQTT.loop();

  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    delay(500);
    return;
  }

  if ( ! mfrc522.PICC_ReadCardSerial()) {
    delay(500);
    return;
  }
  
  if(msgEscrita.equals("teste")){  
    rfidProcess();
  }else{
    escreve();
  }
}

// implementacao dos prototypes

void initSerial() {
  Serial.begin(115200);
}

void initRfid() {
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Aproxime o seu cartao do leitor...");
  Serial.println();
}

// Funcão para se conectar ao Broker MQTT
void initMQTT() {
  MQTT.setServer(BROKER_MQTT, BROKER_PORT);
  MQTT.setCallback(mqtt_callback);
}

//Função que recebe as mensagens publicadas
void mqtt_callback(char* topic, byte* payload, unsigned int length) {

  String message;
  for (int i = 0; i < length; i++) {
    char c = (char)payload[i];
    message += c;
  }
  Serial.println("Tópico => " + String(topic) + " | Valor => " + String(message));

  if(String(topic).equals(String(TOPIC_WRITE))){
    msgEscrita = String(message);
    digitalWrite(D4, HIGH);
  }

  if(String(topic).equals(TOPIC_PONG)){
    if (String(message).equals("1")) // liga led
     {
        digitalWrite(D3, HIGH);
        delay(3000);
        digitalWrite(D3, LOW);
     }
  
     if (String(message).equals("0")) // liga led
     {
        digitalWrite(D4, HIGH);
        delay(3000);
        digitalWrite(D4, LOW);
     } 
  }  
  
  Serial.flush();
}

void reconnectMQTT() {
  while (!MQTT.connected()) {
    Serial.println("Tentando se conectar ao Broker MQTT: " + String(BROKER_MQTT));
    if (MQTT.connect("ESP8266-ESP12-E")) {
      Serial.println("Conectado");
      MQTT.subscribe(TOPIC_PONG);
      MQTT.subscribe(TOPIC_WRITE);

    } else {
      Serial.println("Falha ao Reconectar");
      Serial.println("Tentando se reconectar em 2 segundos");
      delay(2000);
    }
  }
}

void reconnectWiFi() {
  //se já está conectado a rede WI-FI, nada é feito. 
    //Caso contrário, são efetuadas tentativas de conexão
    if (WiFi.status() == WL_CONNECTED)
        return;
        
    WiFi.begin(SSID, PASSWORD); // Conecta na rede WI-FI
    
    if(WiFi.status() != WL_CONNECTED){
      Serial.println("Connection dropped");
      delay(3000);
      ESP.restart(); //reinicia o ESP para iniciar o Wifi Manager 
      delay(3000);
    }
  
    Serial.println();
    Serial.print("Conectado com sucesso na rede: ");
    Serial.print(SSID);
    Serial.println();
    Serial.print("IP obtido: ");
    Serial.print(WiFi.localIP());  // mostra o endereço IP obtido via DHCP
    Serial.println();
    Serial.print("Endereço MAC: ");
    Serial.print(WiFi.macAddress()); // mostra o endereço MAC do esp826
}

void rfidProcess()
{
  Serial.print("UID da tag : ");
  String conteudo = "";
  byte letra;
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    conteudo.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : ""));
    conteudo.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  char UUID[9];
  conteudo.toCharArray(UUID, 9);
  Serial.println(conteudo);
  //MQTT.publish(TOPIC_PING, UUID);

  /////////////////////////////////////////////////////////////////////////////////////
  
  // Prepare key - all keys are set to FFFFFFFFFFFFh at chip delivery from the factory.
  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;

  //some variables we need
  byte block;
  byte len;
  MFRC522::StatusCode status;

  Serial.println(F("**Card Detected:**"));

  //-------------------------------------------

  mfrc522.PICC_DumpDetailsToSerial(&(mfrc522.uid)); //dump some details about the card

  Serial.print(F("Name: "));

  len = 18;
  byte buffer2[18];
  block = 1;

  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, 1, &key, &(mfrc522.uid)); //line 834
  if (status != MFRC522::STATUS_OK) {
    Serial.print(F("Authentication failed: "));
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  }

  status = mfrc522.MIFARE_Read(block, buffer2, &len);
  if (status != MFRC522::STATUS_OK) {
    Serial.print(F("Reading failed: "));
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  }

  String str = "";
  char msg[16];
  //PRINT LAST NAME
  for (uint8_t i = 0; i < 16; i++) {
    Serial.write(buffer2[i] );
    str += String(buffer2[i]);
    msg[i] = buffer2[i];
  }

  String tag = "";
  tag.concat(SALA);
  tag.concat("-");
  tag.concat(conteudo);
  tag.concat("-");
  tag.concat(msg);

  char tagAux[27];
  tag.toCharArray(tagAux, 28);  
  
  MQTT.publish(TOPIC_PING, tagAux);
  //----------------------------------------

  Serial.println(F("\n**End Reading**\n"));

  delay(1000); //change value if you want to read cards faster

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();

}

 
//Função: inicializa e conecta-se na rede WI-FI desejada
//Parâmetros: nenhum
//Retorno: nenhum
void init_WifiAp() 
{
  WiFi.hostname(myHostnameManager);
  WiFiManager wifiManager;
   
  //wifiManager.resetSettings(); //Usado para resetar ssid e senhas armazenadas

  wifiManager.setConfigPortalTimeout(60);
  
  if(!wifiManager.autoConnect(SSIDManager, PASSWORDManager)){
    Serial.println("Failed to connect and hit timeout");
    delay(3000);
    ESP.restart();
    delay(3000);
  }
  Serial.println("Connected");
}

//Função inicializa OTA - permite carga do novo programa via Wifi
void initOTA()
{
  Serial.println();
  Serial.println("Iniciando OTA....");
  ArduinoOTA.setHostname("Denis-Vinicius-OTA"); // Define o nome da porta

  // No authentication by default
   ArduinoOTA.setPassword((const char *)"denis123"); // senha para carga via WiFi (OTA)
  ArduinoOTA.onStart([]() {
    Serial.println("Start");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();
}

//Função: verifica o estado das conexões WiFI e ao broker MQTT. 
//        Em caso de desconexão (qualquer uma das duas), a conexão
//        é refeita.
//Parâmetros: nenhum
//Retorno: nenhum
void VerificaConexoesWiFIEMQTT(void)
{

    reconnectWiFi(); //se não há conexão com o WiFI, a conexão é refeita
    
    if (!MQTT.connected()) 
        reconnectMQTT(); //se não há conexão com o Broker, a conexão é refeita
     
}

//Função: inicializa o output em nível lógico baixo
//Parâmetros: nenhum
//Retorno: nenhum
void InitOutput(void)
{
    //enviar HIGH para o output faz o Led acender / enviar LOW faz o Led apagar)
    
    pinMode(D3, OUTPUT);
    digitalWrite(D3, LOW);
    
    pinMode(D4, OUTPUT);
    digitalWrite(D4, LOW);
              
}

void escreve(){
    // Prepare key - all keys are set to FFFFFFFFFFFFh at chip delivery from the factory.
    MFRC522::MIFARE_Key key;
    for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;
  
    Serial.print(F("Card UID:"));    //Dump UID
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
      Serial.print(mfrc522.uid.uidByte[i], HEX);
    }
    Serial.print(F(" PICC type: "));   // Dump PICC type
    MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
    Serial.println(mfrc522.PICC_GetTypeName(piccType));
  
    byte criptografia[34];
    byte block;
    MFRC522::StatusCode status;
    byte len;
    
    len = msgEscrita.length();
    msgEscrita.getBytes(criptografia, sizeof(criptografia));  
    
    for (byte i = len; i < 30; i++) criptografia[i] = ' ';     // pad with spaces  
    
    block = 1;
    //Serial.println(F("Authenticating using key A..."));
    status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, block, &key, &(mfrc522.uid));
    if (status != MFRC522::STATUS_OK) {
      Serial.print(F("PCD_Authenticate() failed: "));
      Serial.println(mfrc522.GetStatusCodeName(status));
      return;
    }
    else Serial.println(F("PCD_Authenticate() success: "));
  
    // Write block
    status = mfrc522.MIFARE_Write(block, criptografia, 16);
    if (status != MFRC522::STATUS_OK) {
      Serial.print(F("MIFARE_Write() failed: "));
      Serial.println(mfrc522.GetStatusCodeName(status));
      return;
    }
    else {
      Serial.println(F("MIFARE_Write() success: "));
      msgEscrita = "teste";
      digitalWrite(D4, LOW);
    }
  
    Serial.println(" ");
    mfrc522.PICC_HaltA(); // Halt PICC
    mfrc522.PCD_StopCrypto1();  // Stop encryption on PCD
  digitalWrite(D4, LOW);
}
