<img src="assets/images/logo_dark.png" width="60%" title="Notorious Logo">

# Notorious

## Information

A simple note-taking app built using React Native. An app I made to get familiar with development using this framework, as well as something that will hopefully prove to be a useful productivity tool in the future.

This github page provides the source code for the app. [If you want to download the app, go here.](https://github.com/Fr75s/notorious/releases) [If you want more information about the app, go here.](https://fr75s.github.io/notorious/)

[View the full Changelog for the app here.](https://github.com/Fr75s/notorious/blob/main/CHANGELOG.md)

***

## Development Setup & Build

First of all, please note that currently, even though this app does use a cross platform framework, it will not work on iOS. I don't have a Mac to test this app on, so it is unlikely that I will be able to debug this app for iOS.

First, download the source code:

```
$ git clone https://github.com/Fr75s/notorious.git
$ cd bigscraperqt
```

Then, install all dependencies:

```
$ npm install expo
$ npx expo install
```

To run the app:

```
$ npx expo start
```

OR

```
$ npx expo prebuild
$ npx expo run:android
```

To build a release version:

```
$ npx expo prebuild
$ cd android
$ ./gradlew :app:assembleRelease
```
