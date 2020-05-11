
// Tell background.js that this tab should enable the YoutubeThumbnailFaceAvoider popup
chrome.runtime.sendMessage({
  from: 'content',
  subject: 'showPopup',
});


//This var stores an array of all of the videos that have already been checked for faces.
var seenVideos = [];
//This variable stores the index of the first video that we should look at when the YoutubeThumbnailFaceAvoider is ran again.
var startingIndex = 0;

//function is called when we receive a message
chrome.runtime.onMessage.addListener(
  function (request,sender,sendResponse){

    //If the Youtube webpage is not a feed or the Home tab, then we will not iterate over the videos
    if (location.href.includes("watch") || location.href.includes("playlist"))
    {
      sendResponse("Invalid webpage")
      return;
    }


    if (typeof request === 'string') //If the message contained a string
    {
      //if the url is changed (i.e. to the trending, subscription, or home page )
      if (request == "url changed")
      {
        // reset the seen videos and starting index since we may have not seen the videos on this webpage before
        seenVideos = []
        startingIndex = 0;
        console.log("reseted starting index and seen videos")
        return;
      }

      //since the message was not about the url changing, it must be popup.js telling us to start iterating over videos

      //this variable stores whether or not we are on a feed page (trending, subscription) vs the home page
      var onFeed = false;


      //The value of certain variables depends on if we are on a feed page.
      if (!location.href.includes("feed"))
      {
        var videos = document.documentElement.getElementsByTagName("ytd-rich-grid-video-renderer")
      }
      else
      {
        onFeed = true;
        if (location.href.includes("subscriptions"))
        {
          var videos = document.documentElement.getElementsByTagName("ytd-grid-video-renderer")
        }
        else
        {
          var videos = document.documentElement.getElementsByTagName("ytd-video-renderer")
        }
      }

      //This variable stores an array of all of the videos that we found on the webpage
      var videoObjects = []
      //This variable stores the number of new videos that we are seeing
      var numberOfNewVideos = 0

      //This variable stores whether or not all of the videos that we are iterating through have loaded (i.e. their thumbnail has loaded).
      var allVideosLoaded = true;

      //Start iterating over the videos
      for (i = startingIndex; i < videos.length; i++)
      {

        var video = videos.item(i);

        //These two variables store information about the video
        var title = null
        var thumbnailURL = null

        //The following lines scape through the html to get the video title and thumbnail.
        if (!onFeed)
        {
          var temp1 = video.getElementsByTagName("yt-formatted-string")
        }
        else
        {
          if (location.href.includes("subscriptions"))
          {
            var temp1 = video.getElementsByTagName("h3")
          }
          else
          {
            var temp1 = video.getElementsByTagName("yt-formatted-string")
          }
        }
        if (temp1.length > 0)
        {
          if (!onFeed){
            title = temp1[0].innerHTML
          }
          else
          {
            title = temp1[0].textContent
          }

          // Don't continue looking at this video if it has already been seen.
          if (title == "[hidden]" || seenVideos.includes(title))
          {
            continue;
          }

        }

        var thumbnailContainer = video.getElementsByTagName("ytd-thumbnail")
        if (thumbnailContainer.length > 0)
        {
          thumbnailURL = thumbnailContainer[0].getElementsByTagName("img")[0].getAttribute("src")
          if (typeof thumbnailURL == "string")
          {
            seenVideos.push(title)
            numberOfNewVideos += 1
          }
          else //This means that the thumbnail hasn't loaded yet.
          {
            allVideosLoaded = false;
          }

        }


        //Add a videoObject to the array of videoObjects
        videoObjects.push({"title": title, "thumbnailURL": thumbnailURL})

      }

      //If we have seen all of the videos on the webpage then change the starting index so that we don't look at these same videos next time.
      if (allVideosLoaded)
      {
        startingIndex = videos.length - 1;
      }

      //Send popup.js the array of videoObjects
      sendResponse(videoObjects)

    }
    else //Since the message is not a string, it must be the array of videoObjects that should be removed
    {

      var onFeed = false;
      //The value of certain variables depends on if we are on a feed page.
      if (!location.href.includes("feed"))
      {
        var videos = document.documentElement.getElementsByTagName("ytd-rich-grid-video-renderer")
      }
      else
      {

        onFeed = true;
        if (location.href.includes("subscriptions"))
        {
          var videos = document.documentElement.getElementsByTagName("ytd-grid-video-renderer")
        }
        else
        {
          var videos = document.documentElement.getElementsByTagName("ytd-video-renderer")
        }
      }

      //Iterate over all of the videos on the webpage
      for (i = 0; i < videos.length ; i++)
      {

        var video = videos.item(i);

        //These two variables store information about the video
        var title = null
        var thumbnailURL = null
        var thumbnailImage = null
        if (!onFeed)
        {
          var temp1 = video.getElementsByTagName("yt-formatted-string")
        }
        else
        {
          if (location.href.includes("subscriptions"))
          {
            var temp1 = video.getElementsByTagName("h3")
          }
          else
          {
            var temp1 = video.getElementsByTagName("yt-formatted-string")
          }
        }
        if (temp1.length > 0)
        {
          if (!onFeed)
          {
            title = temp1[0].innerHTML
          }
          else
          {
            title = temp1[0].textContent
          }

          //Iterate over all of the videos that should be removed
          for (j = 0; j < request.length; j++)
          {
            var videoObject = request[j]
            if (title == videoObject.title) //if the video should be removed
            {

              var imgContainer = video.getElementsByTagName("img")
              if (imgContainer.length > 0)
              {

                //Replace all images related to the video with a blank black image
                for (k = 0; k < imgContainer.length;k++)
                {
                  var imgURL = chrome.extension.getURL("blackImg.png")
                  imgContainer[k].src = imgURL
                }


              }
              //Replace all text related to the video with "[hidden]"
              for (const details of temp1 )
              {
                details.textContent = "[hidden]"
              }

              if (!onFeed)
              {
                var details = video.getElementsByTagName("ytd-video-meta-block")
              }
              else
              {
                var details = video.getElementsByTagName("h3")
              }
              for (const detail of details)
              {
                detail.textContent = "[hidden]"
              }
              if (onFeed)
              {
                details = video.getElementsByTagName("ytd-channel-name")
                for (const detail of details)
                {
                  detail.textContent = "[hidden]"
                }
                details = video.getElementsByTagName("span")
                for (const detail of details)
                {
                  detail.textContent = "[hidden]"
                }
                details = video.getElementsByTagName("yt-formatted-string")
                for (const detail of details)
                {
                  detail.textContent = "[hidden]"
                }
              }

              console.log("removing video: " + title)




            }
          }


        }
        //Tell popup.js that the videos were removed.
        sendResponse("videos removed");







      }
    }
  }
)
