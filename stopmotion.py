
import cv2, sys

def stopmotion(vid_path, FPS=25.0):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out, w, h = None, None, None

    print("Started creating stopmotion video...")
    cap = cv2.VideoCapture(vid_path)

    if out is None:
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out = cv2.VideoWriter('output.mp4', fourcc, FPS, (w, h))

    prev_frame = None
    frame_count = 0
    total_frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    skips = 15
    while cap.isOpened() or frame_count < 100000:
        print(f"{frame_count}")
        success, frame = cap.read()
        if frame_count % skips == 0:
            prev_frame = frame
            out.write(frame)
        else:
            out.write(prev_frame)
        frame_count += 1
    cap.release()
    
    out.release()

if __name__ == '__main__':
    input_path = sys.argv[1]
    stopmotion(input_path)