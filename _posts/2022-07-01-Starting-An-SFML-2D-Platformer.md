---
layout: post
published: false
title: Working on a 2D SFML C++ Game Part 1.
---

# Building a C++ Platformer Game

So me and one of my colleagues decided to start to work on a project that can teach us more on C++ and programming in general. Since I'm really interested in game development and computer graphics, creating a game seemed like a great idea. We don't have any previous experience on these topics, the only relevant knowledge that we have was being somewhat familiar with C++.

We also didn't have well defined concepts on what the game should look like or what is the goal. As I'm a little interested in game physics I decided to go with a platformer and we also settled on creating 2D games. I think it can be just as demanding, but we can create a game, that feels more complete / production ready, cause 3D graphics needs much more work to achieve good look. (Also no experience in modeling from any of us) Now we also work in a way, that if we have any idea we just start it and see if it works or not. 

The goals that are somewhat established, but it's not set in stone:
 - Platformer with satisfying movement and effects
 - Rogue like design (?)
 - Buff system which improves characther attributes, maybe with expiration ( triple jump, faster movement, faster shooting etc.)
 - NPC dialogues - good story
 - Not that hard, as we are not really into difficult games.

As I use two computers (Windows on my Desktop, Linux on my laptop) and my dear friend is on macOS, we designed everything from ground up to be multiplatform. (There is also a plan for iOS and Android support) It makes the work harder, but I think if you start from this concept it's easier to achieve. This led us to using CMake as the build system, and clang as the main compiler. Currently we use MSVC on Windows, cause "It just works" without additional configuration. We use Visual Studio as an IDE on Windows and Visual Studio Code on the other devices. Sorry I'm not a vim fan (yet).

Earlier I mentioned, the interest in the more low level stuff related to the project, so it was clear from the beginning that we want to avoid complete game engines, and want to go with some media library. The obvious candidates in the C++ world can be SDL, raylib and SFML, and we went with SFML, as it seemed easier than the others. Also it's pretty hard to find complete games in SFML, so let's change that I guess. It can provide motivation for others.

Another important library we decided to use is Box2D. Earlier we used our own potato physics engine and collision system. However later we may want to introduce other objects that needs deeper physical simulation, other collision system. As the lack of knowledge on the topic I decided to adopt the physics engine in the code. I do want to mention though, that you don't need Box2D for most platformers, it's easier to create your own. You wont need 99% of the functionality, and generally you don't really want realistic physic in a platformer.

For map generation and design we've chosen Tiled. It's a very fast and easy to use tile-based map creator.

Good source on libraries for game development: https://github.com/raizam/gamedev_libraries


 
 https://www.youtube.com/watch?v=ce8cum_mnKA
 https://www.youtube.com/watch?v=vFsJIrm2btU
 https://www.youtube.com/watch?v=HU25BJH1PfY
 https://www.youtube.com/watch?v=4RlpMhBKNr0
 
 
 
 maplayer:
 
 beolvasni az összes layert a mapfileból


GUI system:

Widget system:

virtual draw()

void handle(vent ev)

label, button, textbox, listbox



game paraméter state constructor ki az ősbe

ladder : MapLayer
{
	
}