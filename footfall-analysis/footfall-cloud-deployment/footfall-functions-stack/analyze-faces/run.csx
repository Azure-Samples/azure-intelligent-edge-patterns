#r "Newtonsoft.Json"
#r "System.Data"
#r "System.Net.Http"
#r "Microsoft.WindowsAzure.Storage"

using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using System.IO;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Queue;

static HttpClientHandler handler = new HttpClientHandler();

static HttpClient httpClient = new HttpClient(handler, false);


public static async Task<string> Run(byte[] myBlob, string name, string BlobTrigger, ICollector<string> outputEventHubMessage, CloudBlockBlob outputBlob, CloudQueue outputQueue, TraceWriter log)
{
    string msg = $"C# Blob trigger function Processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes\n Location: {BlobTrigger}";
    log.Info(msg);
    log.Info("Hello");

    //string faceUrlBase = "http://38.102.182.49:5000/face/v1.0/";
    string faceUrlBase = Environment.GetEnvironmentVariable("face_api_endpoint");
    string faceApiKey = Environment.GetEnvironmentVariable("face_api_key");

    httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", faceApiKey);

    FaceAnalysis analysis = new FaceAnalysis();

    List<OutputFace> outputFaces = new List<OutputFace>();

    log.Info("Starting rough face detection.");

    //Get Number of Faces (sideways or otherwise)

    string getNumOfFacesParams = "detect?returnFaceId=true&recognitionModel=recognition_02&detectionModel=detection_02";

    var imageContent = new ByteArrayContent(myBlob);
    imageContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

    var response = await httpClient.PostAsync(faceUrlBase + getNumOfFacesParams, imageContent);
    

    var jsonContent = await response.Content.ReadAsStringAsync();

    log.Info(jsonContent);

    analysis.totalFaces = JsonConvert.DeserializeObject<List<Face>>(jsonContent).Count;

    for(int i = 0; i < analysis.totalFaces; i++)
    {
        outputFaces.Add(new OutputFace());
        outputFaces[i].blobName = name;
    }

    log.Info(analysis.totalFaces.ToString());

    //Get all analyzable faces

    string detection01params = "detect?returnFaceId=true&returnFaceAttributes=age,gender,emotion&recognitionModel=recognition_01&detectionModel=detection_01";

    imageContent = new ByteArrayContent(myBlob);
    imageContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

    response = await httpClient.PostAsync(faceUrlBase + detection01params, imageContent);

    jsonContent = await response.Content.ReadAsStringAsync();

    log.Info(jsonContent);

    var faces = JsonConvert.DeserializeObject<List<Face>>(jsonContent);

    analysis.analyzedFaces = faces.Count;

    log.Info(faces.Count.ToString());

    analysis.faces = faces;

    //Calculate emotion score
    foreach( var face in faces)
    {
        double positiveEmotions = Math.Min(face.faceAttributes.emotion.happiness + face.faceAttributes.emotion.surprise
        + face.faceAttributes.emotion.neutral *.5,1);
        double negativeEmotions = Math.Min(face.faceAttributes.emotion.contempt + face.faceAttributes.emotion.sadness
        + face.faceAttributes.emotion.fear + face.faceAttributes.emotion.anger + face.faceAttributes.emotion.disgust,1);

        face.faceAttributes.emotionScore = Math.Truncate(100 * positiveEmotions - negativeEmotions) / 100;
    }

    log.Info("Got face data");
    log.Info("Creating Output Message");

    int count = 0;
    if(analysis.faces.Count>0)
    {
        foreach(var face in analysis.faces)
        {
            outputFaces[count].newFace = true;
            outputFaces[count].analyzed = true;
            outputFaces[count].faceAttributes = face.faceAttributes;
            outputFaces[count].faceRectangle = face.faceRectangle;
            count++;
        }            
    }
    string markedImageUri = "nouri";

    foreach(var outputFace in outputFaces)
    {
        outputFace.markedImageUri = markedImageUri;
        var outputMessageJson = JsonConvert.SerializeObject(outputFace);
        log.Info(outputMessageJson);
        outputEventHubMessage.Add(outputMessageJson);
    }

    log.Info(markedImageUri);
    string analysisString = JsonConvert.SerializeObject(analysis);
    DateTimeOffset dto = new DateTimeOffset(DateTime.Now);
    log.Info(dto.ToUnixTimeSeconds().ToString());
    //log.Info(analysisString);
    return analysisString;
}

public class FaceRectangle
{
    public int height { get; set; }
    public int width { get; set; }
    public int top { get; set; }
    public int left { get; set; }
}

public class Emotion
{        
    public float anger { get; set; }
    public float contempt { get; set; }
    public float disgust { get; set; }
    public float fear { get; set; }
    public float happiness { get; set; }
    public float neutral { get; set; }
    public float sadness { get; set; }
    public float surprise { get; set; }
}

public class FaceAttributes
{
    public Emotion emotion {get; set;}
    public string gender {get; set;}
    public double age {get; set;}
    public double emotionScore {get; set;}
}

public class Face
{
    public string detectionModel {get; set;}
    public string recognitionModel {get; set;}
    public string faceId {get; set;}
    public FaceAttributes faceAttributes {get; set;}
    public FaceRectangle faceRectangle {get; set;}
}

public class FaceAnalysis
{
    public int totalFaces {get; set;}
    public int analyzedFaces {get; set;}
    public int uniqueFaces {get; set;}
    public List<Face> faces {get; set;}
}

public class OutputFace
{
    public bool newFace {get; set;}
    public bool analyzed {get; set;}
    public FaceAttributes faceAttributes {get; set;}
    public FaceRectangle faceRectangle {get; set;}
    public string blobName {get; set;}
    public string markedImageUri {get; set;}
}