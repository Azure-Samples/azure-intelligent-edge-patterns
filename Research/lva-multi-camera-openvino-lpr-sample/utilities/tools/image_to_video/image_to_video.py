import cv2
import os
import re
import ffmpy


def create_video_file(output_path, output_name, fps, width, height):
    path = os.path.join(output_path, output_name)
    codec = cv2.VideoWriter_fourcc(*'DIVX')  # MP4V XVID MPEG DIVX
    if fps < 20:
        fps = 20
    out = cv2.VideoWriter(path, codec, fps, (height, width))
    return out


def convert_avi_to_mkv(to_convert):
    converted = to_convert.replace("avi", "mkv")
    conv = ffmpy.FFmpeg(
        executable='C:\\ffmpeg-win64-static\\bin\\ffmpeg.exe',
        inputs={to_convert: None},
        outputs={converted: None})
    conv.run()


def create_video_from_single_image(input_path, image_name, output_path, fps=20, duration=20):
    path = os.path.join(input_path, image_name)
    image = cv2.imread(path)
    cv2.imshow('Image', image)
    print("Image format: width = {0}; height = {1}; channels = {2}.".format(image.shape[0], image.shape[1],
                                                                            image.shape[2]))
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    output_name = re.sub(".(jpg|jpeg|png)", ".avi", image_name)
    if duration < 10:
        duration = 10
    out = create_video_file(output_path, output_name, fps, image.shape[0], image.shape[1])
    counter = fps * duration
    for _ in range(counter):
        out.write(image)
    out.release()


def create_video_from_images(input_path, image_names, output_path, output_name, width, height, fps=20, duration=20):
    if isinstance(image_names, (list, tuple)):
        if duration < 10:
            duration = 10
        out = create_video_file(output_path, output_name, fps, width, height)
        counter = fps * duration
        for name in image_names:
            input_image_path = os.path.join(input_path, name)
            input_image = cv2.imread(input_image_path)
            image = cv2.resize(input_image, (width, height))
            for _ in range(counter):
                out.write(image)
        out.release()
        convert_avi_to_mkv(os.path.join(output_path, output_name))


if __name__ == "__main__":
    input_path = "C:/vision/image_to_video/images"
    output_path = "C:/vision/image_to_video/output"
    num_files_per_video = 5
    num_videos = 5
    width = 300
    height = 300
    file_names = []
    image_name = "01-90_85-274&361_472&420-475&416_277&422_271&357_469&351-0_0_25_29_33_26_30-165-31.jpg"
    create_video_from_single_image(input_path, image_name, output_path, fps=20, duration=15)
    for file_name in os.listdir(input_path):
        if re.search(".(jpg|jpeg|png)", file_name):
            file_names.append(file_name)
    total = len(file_names) // num_files_per_video
    if num_videos > total:
        num_videos = total
    start = 0
    for i in range(num_videos):
        output_name = "sample" + str(i) + ".avi"
        print(output_name)
        end = (i + 1) * num_videos
        image_names = file_names[start:end]
        start = end
        create_video_from_images(input_path, image_names, output_path, output_name, width, height)
