

// require(["jquery-3.5.1.js"], function (jquery){
//   console.log("Loaded jquery")
// })
// require(["jquery.facedetection.js"], function (jqueryFace){
//   console.log("Loaded face detection")
// })
// var requireFace = require(["face-api.min.js"], function (faceapi){
//   //console.log(faceapi.nets)
//   console.log("Loaded faceapi")
//   //loadModels().catch((error) => {console.log(error);});
//
// })
//require("/jquery.facedetection.js")
//require("/face-api.min.js")
// import * as query from "/jquery-3.5.1.js";
// import * as det from "/jquery.facedetection.js";
// import * as fac from "/face-api.min.js";
// import * as requirejs from "/require.js"
//async function loadModels()
//{


Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).catch((error) => {console.log(error);});
//}

var videoObjectsWithFace = []



//console.log(requirejs.config)
window.addEventListener('DOMContentLoaded',function()
{

  // console.log("started")
  // // ...query for the active tab...
  // chrome.tabs.query({
  //   active: true,
  //   currentWindow: true
  // }, tabs => {
  //   // ...and send a request for the DOM info...
  //   chrome.tabs.sendMessage(
  //       tabs[0].id,
  //       "hi",
  //       // ...also specifying a callback to be called
  //       //    from the receiving end (content script).
  //       setCount);
  // });
  var button = document.getElementById("button")
  button.addEventListener('click',onclick,false)
  //document.querySelector('button').addEventListener('click',onclick,false)
  function onclick () {
    console.log("Clicked")
    chrome.tabs.query({currentWindow: true, active: true},
    function (tabs){
      var divs = document.body.getElementsByTagName("div")

      for (const div of divs)
      {
        div.parentNode.removeChild(div)
      }
      var infoDiv = document.createElement("div")
      document.body.appendChild(infoDiv)
      infoDiv.className = "center"
      infoDiv.textContent = "fetching..."

      chrome.tabs.sendMessage(tabs[0].id,"succeeded",setCount)

    })
  }
  function setCount(videoObjects){
    // faceapi.env.monkeyPatch({
    //   fetch: fetch,
    //   Canvas: window.HTMLCanvasElement,
    //   Image: window.HTMLImageElement,
    //   createCanvasElement: () => document.createElement('canvas'),
    //   createImageElement: () => document.createElement('img')
    // });
    console.log("received video objects")

    detectFaces(videoObjects).catch(error => {
      console.log("detectFaces function failed! Error below:");
      console.error(error);
    })






  }


},false)


async function detectFaces(videoObjects)
{
  var divs = document.body.getElementsByTagName("div")
  for (const div of divs)
  {
    div.parentNode.removeChild(div)
  }
  var infoDiv = document.createElement("div")
  document.body.appendChild(infoDiv)
  infoDiv.className = "center"
  infoDiv.textContent = "analyzing..."

  var videosRemoved = 0;
  var tooManyRequestError = false;
  for (i = 0; i < videoObjects.length; i++){
    var videoObject = videoObjects[i]

    var originalURL = videoObject.thumbnailURL;
    if (originalURL == null || originalURL == 'null')
    {
      //console.log("Video: \"" + videoObject.title + "\" is null")
      continue;
    }

    //console.log(originalURL)
    // const response = await fetch('https://cors-anywhere.herokuapp.com/' + originalURL).catch(error => {
    //   console.log("Error with retrieving thumbnail image")
    //   console.error(error)
    // })
    const response = await fetch('https://evening-cliffs-64942.herokuapp.com/' + originalURL).catch(error => {
      console.log("Error with retrieving thumbnail image")
      console.error(error)
    })

    // if (response.type == "cors")
    // {
    //   tooManyRequestError = true;
    //   console.log("too many requests. stopping")
    //   break;
    // }
    const blob = await response.blob()
    var url = URL.createObjectURL(blob)
    var image = new Image;
    image.src = url;
    const detections = await faceapi.detectAllFaces(image,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()


    if (typeof detections !== 'undefined')
    {
      for (const detection of detections)
      {
        const thumbnailArea = image.width * image.height

        //console.log("Video with face: \"" + videoObject.title + "\"")
        const faceArea = detection.detection._box.width * detection.detection._box.height;
        if (faceArea / thumbnailArea > .05)
        {
          
          if (detection.expressions.surprised > .85 || detection.expressions.fearful > .89 || detection.expressions.angry > .94 || detection.expressions.sad > .9 || detection.expressions.disgusted > .85)
          {
            console.log(videoObject.title + " has annoying face")
            videoObjectsWithFace.push(videoObject);
            videosRemoved += 1
            break;
          }

          //console.log(videoObject.title + " has face bigger than 5% of image")


        }
        else
        {
          if (detection.expressions.surprised > .95 || detection.expressions.fearful > .95 || detection.expressions.angry > .95 || detection.expressions.sad > .95 || detection.expressions.disgusted > .95)
          {
            console.log(videoObject.title + " has annoying small face")
            videoObjectsWithFace.push(videoObject);
            videosRemoved += 1
            break;
          }
        }
      }






    }
    else
    {
      //console.log("Video without face: \"" + videoObject.title + "\"")
      //console.log("no face")
    }
    //console.log("Face thumbnails so far: " + videoObjectsWithFace.length)
  }
  if (tooManyRequestError == false){

    chrome.tabs.query({currentWindow: true, active: true},
    function (tabs){
      console.log("Sending info")
      chrome.tabs.sendMessage(tabs[0].id,videoObjectsWithFace,(msg) => {
        infoDiv.textContent = "finished"
        var videosRemovedDiv = document.createElement("div")
        document.body.appendChild(videosRemovedDiv)
        console.log(msg)
        videosRemovedDiv.className = "center"
        videosRemovedDiv.textContent = "Hid " + videosRemoved + " videos"
        var divs = document.body.getElementsByTagName("div")
        for (const div of divs)
        {
          if (div != videosRemovedDiv){
            div.parentNode.removeChild(div)
          }
        }


      })

    })
  }
  else
  {
    infoDiv.textContent = "Reached Limit"
  }

}
