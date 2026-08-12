# Remix of Remix of ApexLectures Platform

Build a responsive educational content platform called ApexLectures — Powered by MARCO.

I have authorization to use the educational content and backend resources that this application will connect to. The goal is to create a new frontend experience while preserving the existing content structure and functionality.

Branding

Use:

ApexLectures
Powered by MARCO

Logo: https://i.ibb.co/PZThbjmf/1000002876-removebg-preview-2.png

Content & Backend Integration

Create a server-side content integration layer that communicates with the authorized content source.

The integration should:

Dynamically support all supported routes and query parameters.

Retrieve the required HTML/data/assets through the server-side integration layer.

Preserve the existing batch, subject, topic, lesson, and video metadata.

Preserve existing IDs and URL parameters.

Handle new routes dynamically instead of requiring every route to be manually hardcoded.

Gracefully handle unavailable or unsupported routes.

Do not create fake/demo educational content.

Frontend

Create a completely new, simple and modern ApexLectures UI.

The UI should be:

Mobile-first

Fast and lightweight

Responsive

Easy to navigate

Suitable for an educational platform

Create appropriate interfaces for:

Home

Batch listing

Batch details

Subjects

Topics

Lesson/video listing

Video page

Search/navigation pages

Other supported content routes

The actual educational content and metadata should come from the connected authorized source.

Video Handling

For video playback, do not process or re-encode the media.

Use the authorized playback URL supplied by the backend and preserve the existing playback format and parameters. The video player should open/play the supplied playback destination without modifying the media stream.

Telegram Popup

Add a lightweight Telegram join popup.

It should contain:

ApexLectures logo

Short invitation message

JOIN NOW button

Close button

The JOIN NOW button should open:

https://t.me/official_marco_22

Make the popup mobile-friendly and do not show it repeatedly after the user has dismissed it during the same session.

Important Implementation Requirements

Keep the backend integration modular.

Keep the frontend separate from the content integration layer.

Preserve dynamic route parameters.

Preserve supported query parameters.

Add proper loading states and error handling.

Make the UI responsive on Android/mobile browsers.

Do not expose backend credentials or private configuration to the client.

Do not hardcode educational content.

Use the supplied logo and ApexLectures branding throughout the application.

Build the application as a production-ready educational content frontend backed by the authorized content integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8bc57d22-c910-4a53-80f0-823a24013322).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
