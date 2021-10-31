# Picture-Gallery (2014)
A simple whiteboard for pictures to enable cooperative working. The purpose was to show the possibility of an intuitive, real-time, responsive and progressive web-application **without buttons and text**.
A demo of this application can be seen at: https://picture-gallery.azurewebsites.net

## Abstract-Keywords
Buttonless, Real-Time, Progressive Web App (PWA)

## Technical-Keywords
C#, JavaScript, TypeScript, SQLServer, AngularJS, ASP.NET,  WebApi (Async), SignalR, Websockets, JQuery, JQuery-UI, .NET 4.8, Azure SQLServer, Azure Web App, Entity Framework (Code First)

## User Manual
1. At start the loading screen appears showing the loading status in % (!Through real-time abbility the status can be updated from the server side also)
2. When loaded you will see already some images or a simple whitescreen.
3. Drop new images into the whitescreen to add them, like these from example-pics folder. (The border color is your personal id) (!Not added to server in Demo Mode)
4. See how the images appear from another browser instance (Not in Demo mode - Images will disappear after reload there)
5. Manipulate the images and see on other device or browser instance how its done in Real-Time
	1. Dragging them around
	2. Resize them on the corners (or pinch on mobile device)
	3. Double Click/Tap to bring the image to the front
	4. Delete by Drag into Top-Left Corner where it starts to blink (!! Not Synced with Server and other Devices in Demo Mode - After refresh its is restored !! )
6. Add app to Home Screen on your Mobile Device or Tablet to get an Touch experience. (This PWA functionality was added after 2014 of course :-)

## Installation
1. Download and install Visual Studio Community
2. Download the code
3. Browse into folder PictureGallery
4. Create file connections.config
5. Paste following content into connections.config

		<?xml version="1.0"?>
		<connectionStrings>
			<add name="PictureGalleryContext" connectionString="Server=localhost;Initial Catalog=picture-gallery-db;Persist Security Info=False;User ID=TODO;Password=F1ll_Y0UR_PW;" providerName="System.Data.SqlClient" />
		</connectionStrings>
		
6. Build Project in Visual Studio and Run in Debug Mode
7. Database will be created automatically inside an empty db which you gave as config if it does not exists (EF Code First)
8. (Optional) You can whether upload the images in /example-pics folder, by dropping them onto the website, or run /db_init_examples_script.sql in the new db to create some content
