# YoutubeThumbnailFaceAvoider
**Google Chrome extension for YouTube that hides video thumbnails that have a dramatic face**

![Example effect](Images/ThumbnailFaceAvoiderBeforeAfter.jpg)

### Important References

This extension implements the face-api JavaScript face recognition API which can be found [here.](https://github.com/justadudewhohacks/face-api.js/)  
This extension also implements the cors-anywhere NodeJS proxy which can be found [here.](https://github.com/Rob--W/cors-anywhere)

### Motivation

As someone who frequently browses YouTube, I am often annoyed by the clickbait thumbnails that plague so much of the popular content. This is what motivated me to make an application that would remove these thumbnails so I wouldn't have to look at them. Although this application would likely not be practical, I saw this as an oppurtunity to broaden my CS knowledge and skillset.

## The Process

### First Approach

My first approach on creating the application was to use Python, a coding language that I recently used. I knew that Python was widely supported by APIs such as YouTube's Data API. Unfortunately, this API could not efficently help me create the application that I had envisioned. The API did not provide a direct way to access my YouTube subscription feed. The fastest way of doing so was to get the list of channels that I was subscribed to, then iterate over that list and find the most recent video from each channel. This required many requests to the API which led to extremely slow performance. It had to find a new approach.

### The Final Approach
