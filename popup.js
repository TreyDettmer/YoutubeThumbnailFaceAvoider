//This extension uses face-api which can be found here: https://github.com/justadudewhohacks/face-api.js/
//This extension also uses a proxy server which implements cors-anywhere which can be found here: https://github.com/Rob--W/cors-anywhere 


//load face-api models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).catch((error) => {console.log(error);});

// an array that will store all of the videos should be removed
var videosToRemove = [];

window.addEventListener('DOMContentLoaded',function()
{
  //set up button listener for when button is clicked
  var button = document.getElementById("button");
  button.addEventListener('click',onclick,false);

  function onclick () {
    //get tabs
    chrome.tabs.query({currentWindow: true, active: true},
    function (tabs){
      //remove any divs that are being displayed in the popup
      var divs = document.body.getElementsByTagName("div");
      for (const div of divs)
      {
        div.parentNode.removeChild(div);
      }
      var infoDiv = document.createElement("div");
      document.body.appendChild(infoDiv);
      infoDiv.className = "center";
      infoDiv.textContent = "fetching...";

      //tell content.js to start iterating over video thumbnails
      chrome.tabs.sendMessage(tabs[0].id,"iterate over video thumbnails",receivePageInfo);

    })
  }

  //this function is called when content.js sends the array of videoObjects
  //each videoObject includes the title of the video and the url to the video's thumbnail
  function receivePageInfo(videoObjects){

    // if the webpage is not valid for the YoutubeThumbnailFaceAvoider, then content.js returns a string
    if (typeof videoObjects == 'string'){
      // display the problem
      var errorDiv = document.createElement("div");
      document.body.appendChild(errorDiv);
      errorDiv.className = "center";
      errorDiv.textContent = "Invalid webpage";
      var divs = document.body.getElementsByTagName("div");
      for (const div of divs)
      {
        if (div != errorDiv){
          div.parentNode.removeChild(div);
        }
      }
      return;
    }
    console.log("received video objects");

    //detect the faces in the thumbnails
    detectFaces(videoObjects).catch(error => {
      console.log("detectFaces function failed! Error below:");
      console.error(error);
    })






  }


},false)


async function detectFaces(videoObjects)
{
  // change the displayed info in the popup
  var infoDiv = document.body.getElementsByTagName("div")[0];
  infoDiv.textContent = "analyzing...";

  // this variable keeps track of the number of videos that should be removed
  var videosRemoved = 0;



  //iterate over the videoObjects
  for (i = 0; i < videoObjects.length; i++){

    var videoObject = videoObjects[i];
    var originalURL = videoObject.thumbnailURL;

    // the url can be null if the webpage hasn't displayed the thumbnail yet
    if (originalURL == null || originalURL == 'null')
    {
      continue;
    }

    // fetch the thumbnail image
    /*
    'https://evening-cliffs-64942.herokuapp.com/' is the proxy server that I set up.
    The proxy server bypasses the CORS security policy which can block requests to a webpage from a different domain.
    The proxy server can get information from the requested webpage because the CORS security policy only blocks browser-to-server
    communication, not server-to-server communication
    */

    const response = await fetch('https://evening-cliffs-64942.herokuapp.com/' + originalURL).catch(error => {
      console.log("Error with retrieving thumbnail image");
      console.error(error);
    });

    //this code creates the image from the response
    const blob = await response.blob();
    var url = URL.createObjectURL(blob);
    var image = new Image;
    image.src = url;

    // this variable stores the face information of the image
    const detections = await faceapi.detectAllFaces(image,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();


    if (typeof detections !== 'undefined') // if there was atleast one face in the image
    {
      // iterate over the faces in the image
      for (const detection of detections)
      {
        // this variable stores the area of the image
        const thumbnailArea = image.width * image.height;
        // this variable stores the area of the detected face
        const faceArea = detection.detection._box.width * detection.detection._box.height;


        if (faceArea / thumbnailArea > .05) // if the face takes up at least 5% of the image area
        {

          // if the face is animated/dramatic
          /*
            The detection object contains information about the expression of the face.
            The values of the different expressions add up to 1.
            The higher the value for a particular expression, the more confident faceapi is that the face is making that expression.
            I don't check the 'happy' and 'neutral' expressions because those are very common in thumbnails.
          */
          if (detection.expressions.surprised > .85 || detection.expressions.fearful > .89 || detection.expressions.angry > .94 || detection.expressions.sad > .9 || detection.expressions.disgusted > .85)
          {
            console.log("\"" + videoObject.title + "\" has a dramatic face.");

            // add this videoObject to the array of videos that should get removed
            videosToRemove.push(videoObject);
            videosRemoved += 1;

            //break since a face that determines the removal of the video has already been found
            break;
          }



        }
        else //If the face takes up less than 5% of the image, we still should check it but be more lenient since it may not be noticable.
        {
          if (detection.expressions.surprised > .95 || detection.expressions.fearful > .95 || detection.expressions.angry > .95 || detection.expressions.sad > .95 || detection.expressions.disgusted > .95)
          {
            console.log("\"" + videoObject.title + "\" has a dramatic face.");
            videosToRemove.push(videoObject);
            videosRemoved += 1;
            break;
          }
        }
      }






    }


  }

  //get tabs
  chrome.tabs.query({currentWindow: true, active: true},
  function (tabs){

    console.log("Sending info");

    //Send content.js the array of videoObjects that should be removed.
    chrome.tabs.sendMessage(tabs[0].id,videosToRemove,(msg) => {
      // // if the webpage is not valid for the YoutubeThumbnailFaceAvoider, then content.js returns "Invalid webpage"
      if (msg === "Invalid webpage")
      {
        // display the problem
        var errorDiv = document.createElement("div");
        document.body.appendChild(errorDiv);
        errorDiv.className = "center";
        errorDiv.textContent = "Invalid webpage";
        var divs = document.body.getElementsByTagName("div");
        for (const div of divs)
        {
          if (div != errorDiv){
            div.parentNode.removeChild(div);
          }
        }
        return;
      }
      // change the displayed info in the popup
      infoDiv.textContent = "finished";
      var videosRemovedDiv = document.createElement("div");
      document.body.appendChild(videosRemovedDiv);
      videosRemovedDiv.className = "center";

      videosRemovedDiv.textContent = "Hid " + videosRemoved + " videos";

      // remove all displayed info besides the number of videos that were removed
      var divs = document.body.getElementsByTagName("div");
      for (const div of divs)
      {
        if (div != videosRemovedDiv){
          div.parentNode.removeChild(div);
        }
      }


    })

  })



}
