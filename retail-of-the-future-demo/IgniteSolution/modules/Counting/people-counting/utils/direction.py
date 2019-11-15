import enum

class MoveDirection(enum.Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"

class CountDirection(enum.IntEnum):
    HORIZONTAL = 0
    VERTICAL = 1

class ResettableCount:
    resetLoop = False
    
    def __init__(self, resets_to_nonzero):
        self.totalCount = 0
        self.resets_to_nonzero = resets_to_nonzero

def get_horiz_vert(in_direction):
    if in_direction == MoveDirection.UP or in_direction == MoveDirection.DOWN:
        return CountDirection.VERTICAL
    elif in_direction == MoveDirection.LEFT or in_direction == MoveDirection.RIGHT:
        return CountDirection.HORIZONTAL

    raise ValueError("Unknown direction")

def get_dir_dimension(in_direction, width, height):
    if get_horiz_vert(in_direction) == CountDirection.VERTICAL:
        return height
    else:
        return width

def get_cur_direction_names(in_direction):
    if get_horiz_vert(in_direction) == CountDirection.VERTICAL:
        return ("Up", "Down")
    else:
        return ("Left", "Right")

def get_trigger_count(prevPos, curPos, crossPos):
    '''
    prevPos - where we saw it before
    curPos - where it is now
    crossPos - value that triggers counting

    Returns:
    -1 (or 1) move in the direction of diminishing (increasing) coordinates AND
    having crossed the line (crossPos)
    0 otherwise
    '''

    if prevPos <= crossPos < curPos:
        return 1
    elif curPos < crossPos <= prevPos:
        return -1
    else:
         return 0