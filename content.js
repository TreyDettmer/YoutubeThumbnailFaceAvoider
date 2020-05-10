//works on home page. To work on subscriptions page change to ytd-item and ytd-grid
// Inform the background page that
// this tab should have a page-action.
chrome.runtime.sendMessage({
  from: 'content',
  subject: 'showPageAction',
});
var seenVideos = []
var startingIndex = 0;

chrome.runtime.onMessage.addListener(
  function (request,sender,sendResponse){
    if (typeof request === 'string')
    {
      if (request == "url changed")
      {
        seenVideos = []
        startingIndex = 0;
        console.log("reseted starting index and seen videos")
        return;
      }
      var onFeed = false;
      if (!location.href.includes("feed"))
      {
        var videos = document.documentElement.getElementsByTagName("ytd-rich-grid-video-renderer")
      }
      else
      {
        onFeed = true;
        console.log("is feed")
        if (location.href.includes("subscriptions"))
        {
          var videos = document.documentElement.getElementsByTagName("ytd-grid-video-renderer")
        }
        else
        {
          var videos = document.documentElement.getElementsByTagName("ytd-video-renderer")
        }
      }
      var videoObjects = []
      var numberOfNewVideos = 0
      var allVideosLoaded = true;
      for (i = startingIndex; i < videos.length; i++)
      {
        //console.log("VIDEO")
        var video = videos.item(i);


        var title = null
        var thumbnailURL = null
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
          else
          {
            allVideosLoaded = false;
          }

        }


        //videoObjects.push(video.innerHTML)

        videoObjects.push({"title": title, "thumbnailURL": thumbnailURL})




      }
      if (allVideosLoaded)
      {
        startingIndex = videos.length - 1;
      }
      //console.log("new videos: " + numberOfNewVideos)
      //videoObjects.forEach(video => console.log(video))
      sendResponse(videoObjects)

    }
    else
    {
      var onFeed = false;
      if (!location.href.includes("feed"))
      {
        var videos = document.documentElement.getElementsByTagName("ytd-rich-grid-video-renderer")
      }
      else
      {
        console.log("is feed")
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
      for (i = 0; i < videos.length ; i++)
      {
        var video = videos.item(i);

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
          var j;
          for (j = 0; j < request.length; j++)
          {
            var videoObject = request[j]
            if (title == videoObject.title)
            {
              //temp1[0].innerHTML = "*Avoided by Extension*"
              // console.log("removing: " + request[j].title)
              // videos[i].parentNode.removeChild(videos[i])
              // i -= 1
              // var aS = videoRenderer[0].getElementsByTagName("a")
              // for (const item of aS)
              // {
              //   item.textContent = "penis"
              // }
              // var spanS = videoRenderer[0].getElementsByTagName("span")
              // for (const item of spanS)
              // {
              //   item.textContent = "penis"
              // }
              var imgContainer = video.getElementsByTagName("img")
              if (imgContainer.length > 0)
              {

                for (k = 0; k < imgContainer.length;k++)
                {
                  var imgURL = chrome.extension.getURL("blackImg.png")
                  imgContainer[k].src = imgURL
                }


              }
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
        sendResponse("videos removed");







      }
    }
  }
)
