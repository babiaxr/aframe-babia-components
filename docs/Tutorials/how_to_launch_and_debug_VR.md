---
linktitle: "how_to_debug"
date: 2021-04-19T12:40:05+02:00
title: How to launch and debug VR scenes with and without a VR device
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "debug", "launch", "VR", "guide"]
---

# Launch and debug VR scenes with and without a VR device

In order to launch or debug your pages or applications in VR, there are different options than you can examine.

- **If you have access to a VR device**, connecting it to your computer will allow you to launch your pages or applications on your device. It will also let you debug them and transfer files between your computer and your device. There are different options to connect, depending on which operating system your computer has.

  The following tutorials will focus on connecting Oculus Quest 1 and 2 to Linux, Windows and Mac, in order to access your local server, debug or transfer files. They will also explain how to take screenshots or videos of the scenes.

  >Note: If you have a Windows or a Mac, you will be able to connect using Wi-Fi or USB, while Linux only supports connections with USB for now.

- **If you do not have access to a VR device**, the last topic on this article explains how to simulate VR from the desktop browser.

------
## Index:

1. How to connect Oculus Quest with USB

2. How to connect Oculus Quest with Wi-Fi (Windows and Mac)

3. How to access your local server in Oculus Quest

4. How to debug pages loaded in Oculus Quest

5. How to debug VR without a VR device

--------
## How to connect Oculus Quest with USB

### **First steps**

1. If this is the first time you are using your Oculus Quest, remember to download the **Oculus App** and configure it following the steps on [Oculus Setup](https://www.oculus.com/setup/).

2. After these steps, you should have registered as a user (your registration can be associated to a Facebook account), connected your Quest to the Oculus App and configured the basic settings.

3. Before continuing, you should register or join a development organization, if you have not done it already.

4. On the app, go to **Settings**, choose your device and go to **More settings -> Developer mode**. Make sure the **Developer mode** is activated. You can also activate the **Developer mode** in the Quest.

5. Connect your Quest to your computer via USB, accept the **Allow access to data** popup that will appear on the headset.

6. Accept **Allow USB debugging** and check **Always allow from this computer** if the popup appears on your headset (in some cases, it will appear later on).

### **Connecting with Windows**

To connect with Windows using Oculus Link, follow the [oficial documentation](https://support.oculus.com/444652019523821/). Oculus Link will allow you to mirror your PC screen on Oculus, therefore you can make use of the performance and graphics of your computer on your Oculus.

>Note: You can also setup [USB debugging](https://developer.oculus.com/documentation/oculus-browser/browser-remote-debugging/?locale=es_ES&device=QUEST).

### **Connecting with Mac**

1. Install [Homebrew](https://brew.sh/index)

    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"    
    ```
2. Install ADB platform tools

   ```
    brew install android-platform-tools    
    ```
3. Run

    ```
    adb devices
    ```

- If your device is connected, it should appear here.
- If it is unauthorized, put on your headset, you should now see the **Allow USB debugging** popup. Accept it and check **Always allow from this computer**. Then run again `adb devices`, it should now appear.

- If it does not show, do not worry, since it does not always appear in Mac. Check that it is connected by following the steps in **How to debug pages in Oculus Quest with USB** tutorial or install ODH following the next tutorial.

### **Oculus Developer Hub with Windows or Mac**

1. Install Oculus Developer Hub.

2. Open the app and log in with the same credentials as in your Quest.

>Note: ODH comes with ADB installed, in case you have already installed your own (following previous tutorials or via Android Studio, for example), use existing version from your computer by changing the ADB path when asked for it. You can always change it in Settings.

3. Go to **My Device**. If you have properly connected your device, you should now see it in the app. If you do not see it or it says disconnected, click **Add Device**. This will remind you to follow all the steps you should have already done. Try to repeat the steps and if it still does not work, try restarting your Oculus, disconnect and connect again you USB or even try with a different USB cable (Remember it should be USB 3.0).

4. From **My Device** screen you can take screeshots and videos, cast, access Quest shared storage, control connections and configure many other settings. It also tests Quest performance, allows you to add APKs to run on your device and lets you activate **ADB over Wi-Fi**

### **Connecting with Linux**

1. Install ADB platform tools.

2. Run

    ```
    adb devices
    ```

- If your device is connected, it should appear here.
- If it is unauthorized, put on your headset, you should now see the **Allow USB debugging** popup. Accept it and check **Always allow from this computer**. Then run again `adb devices`, it should now appear.

>Note 1: In order to launch your page on Oculus, please proceed to the [How to access your local server in Oculus Quest](#how-to-access-your-local-server-in-oculus-quest) tutorial.
 
>Note 2: In order to debug from the computer what you are seeing on Oculus, please proceed to the [How to debug pages loaded in Oculus Quest](#how-to-debug-pages-loaded-in-Oculus-Quest) tutorial.

-------
## How to connect Oculus Quest with Wi-Fi (Windows and Mac)

1. Follow the steps to install and connect your device with USB and ODH in **How to connect Oculus Quest with USB** ->
**Oculus Developer Hub with Windows or Mac**.

2. Go to **My Devices** and allow **ADB over Wi-Fi** for your device.

3. You can now disconnect the USB and your device will still be connected.

>Note 1: On Windows, you can also setup [Wi-Fi for debugging](https://developer.oculus.com/documentation/oculus-browser/browser-remote-debugging/?locale=es_ES&device=QUEST).

>Note 2: In order to launch your page on Oculus, please proceed to the [How to access your local server in Oculus Quest](#how-to-access-your-local-server-in-oculus-quest) tutorial.

>Note 3: In order to debug from the computer what you are seeing on Oculus, please proceed to the [How to debug pages loaded in Oculus Quest](#how-to-debug-pages-loaded-in-Oculus-Quest) tutorial.
-------

## How to access your local server in Oculus Quest

There are two approaches to access your local server in your Oculus Quest. If your Oculus are connected to the same Wi-Fi as your computer, you can try and follow the first tutorial. If you find any security or permits problem or you are not connected to the same Wi-Fi, go straigth to the second option. You can always use the second option directly.

### 1st Option. Get your IP

There is no need to be connected for this option.

1. Launch your server on your desktop and copy the IP.
2. Put on your headset and open Oculus Browser or Firefox Reality .
3. Navigate to that same IP.

### 2nd Option. Adb reverse

Once connected, you can access the server you have launched by accessing a local server in your Oculus Quest.

1. Run adb reverse

    ```
    adb reverse tcp:port-to-access-on-oculus tcp:port-on-linux
    ```

    For example: _adb reverse tcp:3000 tcp:7000_

2.  Access the page in **Oculus Browser** or in **Firefox Reality** in your Quest.
  
    In previous example, you would access _localhost:3000_

    >Note: Make sure that, if your server is running on https, your localhost in Quest is running on https too.

------

## How to debug pages loaded in Oculus Quest

### **On Chrome and using Oculus Browser**

1. After connecting your device, use the **Oculus Browser** to access the page you desire (it could be the localhost explained in the previous tutorial)

2. Open Chrome on your computer and go to `chrome://inspect/#devices`.

3. Make sure the **Discover USB devices** checkbox is checked.

4. Click on **Port forwarding**.

5.  Make sure the **Enable port forwarding** checkbox is checked. Then click on **done**.

6. You should now see the connected devices. If they are properly connected, they will show a green dot. Under the devices, you should see the current pages that you have opened with Oculus Browser.

>Note: If you do not see your device, **refresh** and put on headset, you should now see the **Allow USB debugging** popup. Accept it and check **Always allow from this computer**.

7. Click on **inspect** , this will show a debug window with developer tools. You can now debug what is showing in Oculus Browser. 

>Note: Do not forget to activate VR or you will be seeing the normal browser and for that it is easier to debug from Chrome directly.

### **On Firefox and using Firefox Reality**

>Note: In order to debug with Firefox, you need to have the latest Firefox or Firefox Developer Edition. You will also need the latest Mozilla Nightly. Also make sure your Firefox Reality on Oculus is up to date.

1. After connecting your device, launch **Firefox Reality** on Oculus, go to **Settings → Developer Options** and make sure **Remote debugging** is ON.

2. Access the page you desire (it could be the localhost explained in the previous tutorial).

3. Open Firefox or Firefox Developer Edition on your computer and go to **Web Developer Tools → Settings**. Make sure **Enable Remote Debugging** checkbox is checked.

4. In Firefox, go to **Web Developer → Remote Debugging**. In Firefox for Developers, go to **More Tools → Remote Debugging**. Make sure **USB** is enabled.

>Note: This will turn on the **Firefox DebTools ADB Extension**, you could also activate it from the add-ons page.

5. You should now see your device on the left side.

>Note: If you do not see your device, **refresh** and put on headset, you should now see the **Allow USB debugging** popup. Accept it and check **Always allow from this computer**. If it still does not show, try refreshing again or turning off and on the **USB** option.

6. Click **Connect** next to your device. Then click on its name.

7. Find the tab you are looking for and click **inspect**, this will show a debug window with developer tools. You can now debug what is showing in Oculus Browser. 

>Note: Do not forget to activate VR or you will be seeing the normal browser and for that it is easier to debug from Chrome directly.

-----

## How to debug VR without a VR device

### **First steps**

Install the WebXR extension in your browser and open developer tools:

 #### **Mozilla Firefox and Firefox Developer Edition**

 1. Install [WebXR API Emulation Extension](https://addons.mozilla.org/es/firefox/addon/webxr-api-emulator/).

 2. Open Web **Developer Tools -> WebXR** or **More Tools -> Developer Tools -> WebXR**. You will see a headset and one or two controllers (depending on the set).

 ![WebXR API on Firefox image](https://i.imgur.com/IEseHjl.jpg)

 #### **Google Chrome:**
 1. Install [WebXR API Emulation Extension](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje).

 2. Open **Developer Tools -> WebXR**. You will see a headset and one or two controllers (depending on the set).

  ![WebXR API on Chrome image](https://i.imgur.com/wzdN6p7.jpg)

### **Start debugging**
 
 1. Click on VR to start the visualization. The headset and the controllers will be now activated.

 ![VR on Chrome image](https://i.imgur.com/ULjyznc.jpg)

 2. Choose between different sets of VR devices and you can start debugging.

  ![VR on Chrome image](https://i.imgur.com/oLRImK4.jpg)


 3. Remember that in order to move around the scene, you will have to interact individually with every device (the headset and each of the controllers), in this way:

  - **First click on device:** focus on device, showing the three axis and allowing you to change its position.

  ![Position focus image](https://i.imgur.com/L1UryPn.jpg)


  - **Second click on device:** still focusing, it now allows you to rotate it.

  ![Rotation focus image](https://i.imgur.com/DrToCqs.jpg)

  - **Third click on device:** loses its focus.

  ![No focus image](https://i.imgur.com/WKRJ2C4.jpg)


