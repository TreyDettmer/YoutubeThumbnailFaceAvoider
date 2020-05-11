# YoutubeThumbnailFaceAvoider
**Google Chrome extension for YouTube that hides video thumbnails that have a dramatic face**

![Example effect](Images/ThumbnailFaceAvoiderBeforeAfter.jpg)

### Important References

This extension implements the face-api JavaScript face recognition API which can be found [here.](https://github.com/justadudewhohacks/face-api.js/)  
This extension also implements the cors-anywhere NodeJS proxy which can be found [here.](https://github.com/Rob--W/cors-anywhere)

### Motivation

As someone who frequently browses YouTube, I am often annoyed by the clickbait thumbnails that plague so much of the popular content. This is what motivated me to make an application that would remove these thumbnails so I wouldn't have to look at them. Although this application would likely not be practical, I saw this as an oppurtunity to broaden my CS knowledge and skillset.

## The Process

### The Design Idea

### First Approach

My first approach on creating the application was to use Python, a coding language that I recently used. I knew that Python was widely supported by APIs such as YouTube's Data API. Unfortunately, this API could not efficently help me create the application that I had envisioned. The API did not provide a direct way to access my YouTube subscription feed. The fastest way of doing so was to get the list of channels that I was subscribed to, then iterate over that list and find the most recent video from each channel. This required many requests to the API which led to extremely slow performance. I had to find a new approach.

### The Final Approach

The next and final approach was creating the application using JavaScript. When researching for face detection APIs, one of the most popular results was face-api, a "JavaScript face recognition API for the browser and nodejs implemented on top of tensorflow.js core" created by [justadudewhohacks](https://github.com/justadudewhohacks). It had been many years since I had written anything in JavaScript but I decided to give it a go. I found out that making a Google Chrome extension would be the best way to accomplish my goal since the extension could use JavaScript as well as access the current webpage.  
  
The first hurdle I faced was implementing face-api. Google Chrome extensions contain content scripts which can access the current webpage's HTML code. However, these content scripts live in their own isolated worlds, meaning that they can not access other files. face-api includes a models folder which contains neccessary files that are not written in JavaScript. This means that the content page has no way to access them. The solution to this problem was implenting face-api in the popup.js file which was not a content script. The popup.js file brings functionality to the extension's button at the top right corner of the browser.  
This is how the extension works:  
  * popup.js sends a message to content.js informing the script that it should iterate over all of the videos on the webpage
  * content.js responds to popup.js with an array of all of the video objects (each object includes the video title and thumbnail)
  * popup.js iterates over the video objects and determines which videos have a dramatic face in their respective thumbnail
  * popup.js sends a message to content.js including all of the video objects that should be removed
  * content.js iterates over all of the videos again and removes the videos that were provided by popup.js
