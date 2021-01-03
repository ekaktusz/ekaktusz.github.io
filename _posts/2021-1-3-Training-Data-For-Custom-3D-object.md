---
layout: post
title: Synthetic Dataset Generation for Custom 3D Object Using Blender
excerpt_separator: <!--more-->
---

During my thesis work I faced the problem of how purely documented is the subject of synthetically generated learning datasets for custom 3D objects, so here are my tips.

<!--more-->

<style type="text/css">
  // Adding 'Contents' headline to the TOC
	#markdown-toc::before {
	    content: "Contents";
	    font-weight: bold;
	}


	// Using numbers instead of bullets for listing
	#markdown-toc ul {
	    list-style: decimal;
	}

	#markdown-toc {
	    border: 1px solid #aaa;
	    padding-left: 2em;
	    padding-right: 2em;
	    padding-top: 1em;
	    padding-bottom: 1em;
	    list-style: decimal;
	    display: inline-block;
	}
</style>

* Do not remove this line (it will not be displayed)
{:toc}
## Why would you need this?
{:refdef: style="text-align: center;"}
![My image Name](/images/why.gif)
{: refdef}

You might work in a simulation environment where pretrained neural networks won't work as precise as you expect or you just can't find any public dataset for the object you want to detect. 

## Sources
My project is **heavily** inspired from [this](https://olestourko.github.io/2018/02/03/generating-convnet-training-data-with-blender-1.html) post from Oles Tourko about ConvNet training data with Blender. Check out his work, it's very very very useful.


## Guide

Okay, so I had a cute 3D model of a penguin (stole it from [here](https://free3d.com/3d-model/emperor-penguin-601811.html)) and I really wanted to make my network to detect it, therefore I had to generate a __*huuuge*__ amount of training data from the model, like render images. My model was compatible with Blender, so I load it in, then used Blender Python API. [Here](https://www.youtube.com/watch?v=cyt0O7saU4Q) is a simple video to understand the very basics of it, but honestly it's fairly easy to use. 

### Code

Aaaand here is the script I used.

{% highlight python %}
#include <iostream>

import bpy
import os
import random
import math
import time
import numpy as np

# Change these values for personal need
OBJECT_NAME = "Penguin"
OBJECT_PATH = "/home/ekaktusz/Downloads/pingvin/PenguinBaseMesh.blend"
CAMERA_NAME = "Camera"
LIGHT_NAME = "Light"
IMG_FOLDER_PATH = "/home/ekaktusz/Pictures/test_data/"
RESOLUTION_X = 960
RESOLUTION_Y = 720
BACKGROUND_PATH= "/home/ekaktusz/Pictures/hatterek_training/"
NUM_OF_TRAINING_DATA = 10

# take a lot of pictures
def create_training_data():
    for i in range(NUM_OF_TRAINING_DATA):
        rotate_object()
        place_light_random()
        place_camera_random()
        look_at_penguin()
        take_picture(i)
        create_label_file(i)

# take a picture from the camera
def take_picture(num):
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.render.filepath = IMG_FOLDER_PATH + str(num) + '.jpg'
    bpy.context.scene.render.resolution_x = RESOLUTION_X
    bpy.context.scene.render.resolution_y = RESOLUTION_Y
    bpy.ops.render.render(write_still = True)

# add a penguin object to the origo
def add_object():
    file_path = OBJECT_PATH
    inner_path = "Object"
    object_name = OBJECT_NAME
    
    bpy.ops.wm.append(
        filepath=os.path.join(file_path, inner_path, object_name),
        directory=os.path.join(file_path, inner_path),
        filename=object_name
        )

# rotate to random direction
def rotate_object():
    my_object = bpy.data.objects[OBJECT_NAME]
    x = math.radians(random.randint(-90,90))
    y = math.radians(random.randint(-90,90))
    z = math.radians(random.randint(0,359))
    my_object.rotation_euler[0] = x
    my_object.rotation_euler[1] = y
    my_object.rotation_euler[2] = z

# turn camera to object that we want to model
def look_at_penguin():
    bpy.ops.object.mode_set(mode='OBJECT')
    my_object = bpy.data.objects[OBJECT_NAME]
    default_camera = bpy.data.objects[CAMERA_NAME]
    
    point = my_object.matrix_world.to_translation()
    loc_camera = default_camera.matrix_world.to_translation()

    direction = point - loc_camera
    rot_quat = direction.to_track_quat('-Z', 'Y')

    default_camera.rotation_euler = rot_quat.to_euler()

# place camera to random location
def place_camera_random():
    bpy.ops.object.mode_set(mode='OBJECT')
    default_camera = bpy.data.objects[CAMERA_NAME]
    default_camera.location.x = round(random.uniform(-10,10), 5)
    default_camera.location.y = round(random.uniform(-10,10), 5)
    default_camera.location.z = round(random.uniform(0,8), 5)

# distance from camera to penguin
def distance():
    default_camera = bpy.data.objects[CAMERA_NAME]
    my_object = bpy.data.objects[OBJECT_NAME]
    return math.sqrt( (default_camera.location.x - my_object.location.x) ** 2 + (default_camera.location.y - my_object.location.y) ** 2  + (default_camera.location.z - my_object.location.z) ** 2 )

# place default light to random location
def place_light_random():
    bpy.ops.object.mode_set(mode='OBJECT')
    default_light = bpy.data.objects[LIGHT_NAME]
    default_light.location.x = round(random.uniform(-10,10), 5)
    default_light.location.y = round(random.uniform(-10,10), 5)
    default_light.location.z = round(random.uniform(0,8), 5)

def clamp(x, minimum, maximum):
    return max(minimum, min(x, maximum))

# calculate bounding box on render image
def camera_view_bounds_2d():
    scene = bpy.context.scene
    my_object = bpy.data.objects[OBJECT_NAME]
    default_camera = bpy.data.objects[CAMERA_NAME]

    mat = default_camera.matrix_world.normalized().inverted()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    mesh_eval = my_object.evaluated_get(depsgraph)
    me = mesh_eval.to_mesh()
    me.transform(my_object.matrix_world)
    me.transform(mat)

    camera = default_camera.data
    frame = [-v for v in camera.view_frame(scene=scene)[:3]]
    camera_persp = camera.type != 'ORTHO'

    lx = []
    ly = []

    for v in me.vertices:
        co_local = v.co
        z = -co_local.z

        if camera_persp:
            if z == 0.0:
                lx.append(0.5)
                ly.append(0.5)
            if z <= 0.0:
                continue
            else:
                frame = [(v / (v.z / z)) for v in frame]

        min_x, max_x = frame[1].x, frame[2].x
        min_y, max_y = frame[0].y, frame[1].y

        x = (co_local.x - min_x) / (max_x - min_x)
        y = (co_local.y - min_y) / (max_y - min_y)

        lx.append(x)
        ly.append(y)

    min_x = clamp(min(lx), 0.0, 1.0)
    max_x = clamp(max(lx), 0.0, 1.0)
    min_y = clamp(min(ly), 0.0, 1.0)
    max_y = clamp(max(ly), 0.0, 1.0)

    mesh_eval.to_mesh_clear()

    r = scene.render
    fac = r.resolution_percentage * 0.01
    dim_x = r.resolution_x * fac
    dim_y = r.resolution_y * fac

    if round((max_x - min_x) * dim_x) == 0 or round((max_y - min_y) * dim_y) == 0:
        return (0, 0, 0, 0)
    
    original_x = round(min_x * dim_x)            # X
    original_y = round(dim_y - max_y * dim_y)    # Y
    original_w = round((max_x - min_x) * dim_x)  # Width
    original_h = round((max_y - min_y) * dim_y)  # Height

    # convert values to be compatible with YOLO label files
    # <object-class> <x_center> <y_center> <width> <height>
    return_x = round((original_x + round(original_w/2)) / RESOLUTION_X, 6) # center_x normal
    return_y = round((original_y + round(original_h/2)) / RESOLUTION_Y, 6) # center_y normal
    return_w = round(original_w / RESOLUTION_X, 6)                         # width normal
    return_h = round(original_h / RESOLUTION_Y, 6)                         # height normal
    
    return (return_x, return_y, return_w, return_h)

# generate .txt label files in the same folder
def create_label_file(num):
    file_name = IMG_FOLDER_PATH + str(num) + '.txt'
    with open(file_name, "w+") as file:
        bounding_box = camera_view_bounds_2d()
        file.write("0 " + ' '.join(format(f, '.6f') for f in bounding_box))

# uncomment to add object to blender
# add_object()
create_training_data()


{% endhighlight %}

#### Step by step

The function names and comments in code are pretty straightforward IMO, so I won't explain it in depth. Basically the following things happens: (in a for loop)
1. Rotate the object (in my case this wholesome emperor penguin)
2. Put the default light in a random location in selected range - Honestly not even sure if its neccessary, but whatever
3. The third function works *exactly* like the previous one, just move the camera.
4. Direct the camera to point to the center point of penguin.
5. Next we render the picture! Yay!
6. Then the scritps just creates a txt file for each image in the right format for YOLO training.

So yes, the only tricky part (calculation of bounding box coordinates on render images) can be found [here](https://blender.stackexchange.com/questions/7198/save-the-2d-bounding-box-of-an-object-in-rendered-image-to-a-text-file) with more comments.

### Extra script for adding background

If you have paid attention you may see that the generated renders have transparent background and saved in png format. I decided to do this, because I didn't found a simple solution for adding background in blender to the renders. I created a seperate script (NOT a Blender script), that can be executed after the first one completed. (Inspired by [this](https://stackoverflow.com/questions/38627870/how-to-paste-a-png-image-with-transparency-to-another-image-in-pil-without-white/38629258) stackoverflow thread)

{% highlight python %}
from PIL import Image
import os
import random

# Change these values for personal need
OBJECT_NAME = "Penguin"
OBJECT_PATH = "/home/ekaktusz/Downloads/pingvin/PenguinBaseMesh.blend"
CAMERA_NAME = "Camera"
LIGHT_NAME = "Light"
IMG_FOLDER_PATH = "/home/ekaktusz/Pictures/test_data/"
RESOLUTION_X = 960
RESOLUTION_Y = 720
BACKGROUND_PATH= "/home/ekaktusz/Pictures/hatterek_training/"
NUM_OF_TRAINING_DATA = 10

background_files = os.listdir(BACKGROUND_PATH)
background_files.remove(".directory")

def add_bacground_to_img(num):
    filename = IMG_FOLDER_PATH + str(num) + '.png'
    ironman = Image.open(filename, 'r')
    filename1 = BACKGROUND_PATH + random.choice(background_files)
    bg = Image.open(filename1, 'r')
    text_img = Image.new('RGBA', (RESOLUTION_X,RESOLUTION_Y), (0, 0, 0, 0))
    text_img.paste(bg, ((text_img.width - bg.width) // 2, (text_img.height - bg.height) // 2))
    text_img.paste(ironman, ((text_img.width - ironman.width) // 2, (text_img.height - ironman.height) // 2), mask=ironman)
    text_img = text_img.convert('RGB')
    text_img.save(IMG_FOLDER_PATH + str(num) + ".jpg", format="jpeg")
    os.remove(filename)

for i in range(NUM_OF_TRAINING_DATA):
    print("Processing " + str(i) + ". image...")
    add_bacground_to_img(i)

{% endhighlight %}

## Training
And at this point I had everything to start the training. It can be easily done by following the [official guide](https://github.com/AlexeyAB/darknet#how-to-train-to-detect-your-custom-objects) for Darknet. Good luck!




<!---
![_config.yml]({{ site.baseurl }}/images/first-post.png)-->
