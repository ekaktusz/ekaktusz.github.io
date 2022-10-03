---
layout: post
title: Building a C++ Platformer Game with SFML // Part I. Beginnings
---

<!--# Building a C++ Platformer Game - Part1: Beginnings-->
So, me and one of my colleagues decided to start to work on a project that could teach us more about C++ and programming in general. Since I'm really interested in game development and computer graphics, creating a game seemed like a great idea.

​We didn't have any previous experience on these topics. The only relevant knowledge that was related was being somewhat familiar with C++.

{:refdef: style="text-align: center;"}
![My image Name](/images/mario.gif)
{: refdef}

## The Concept
We also didn't have well-defined concepts of what the game should look like or what the goal is. As I'm a little interested in game physics, I decided to go with a platformer and we also settled on creating a 2D game. I think it can be just as demanding, but we can create a game that feels more complete / production ready, because 3D graphics need much more work to achieve a good game. (Also, no experience in modeling from any of us) Now we also work in a way, that​ if we have any idea we just start it and see if it works or not, so no complex plans on development.

We did manage to come up some pseudo-established goals.
 - It should be a platformer with satisfying movement and effects (insipired by Celeste)
 - Rogue like design (Maybe it's easier to achive?)
 - Buff system which improves characther attributes, maybe with expiration ( triple jump, faster movement, faster shooting etc.)
 - NPC dialogues - good story, narrative-driven gameplay
 - Not that hard, as we are not really into difficult games.

 {:refdef: style="text-align: center;"}
![My image Name](/images/celeste.gif)
{: refdef}

## Platform and Development Environment
As I use two computers (Windows on my Desktop, Linux on my laptop) and my dear friend is on macOS, we designed everything from ground up to be multiplatform. (There is also a plan for iOS and Android support later) It makes the work harder, but I think if you start from this concept it's easier to achieve. This led us to using CMake as the build system, and clang as the main compiler. Currently we use MSVCC on Windows, cause "It's just works" without additional configuration. We use Visual Studio on Windows and Visual Studio Code on the other devices.

Earlier I mentioned the interest in the more low level stuff related to the project, so it was clear from the beginning that we wanted to avoid complete game engines, and wanted to go with some media library. The obvious candidates in the C++ world could be SDL, raylib and SFML, and we went with SFML, as it seemed easier than the others. Also, it's pretty hard to find complete games in SFML, so let's change that. I guess, It could provide motivation for others.

See you soon with some updates!

Good source on libraries for game development: https://github.com/raizam/gamedev_libraries