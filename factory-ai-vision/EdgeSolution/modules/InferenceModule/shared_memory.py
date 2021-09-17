import tempfile
import mmap
import os
import logging
from exception_handler import PrintGetExceptionDetails

# ***********************************************************************************
# Shared memory management 
#
class SharedMemoryManager:
    def __init__(self, shmFlags=None, name=None, size=None):
        try:
            self._shmFile = None # to prevent destructor crashing if file fails to open
            
            self._shmFilePath = '/dev/shm'
            self._shmFileName = name
            if self._shmFileName is None:
                self._shmFileName = next(tempfile._get_candidate_names())

            self._shmFileSize = size
            if self._shmFileSize is None:
                self._shmFileSize = 1024 * 1024 * 10     # Bytes (10MB)

            self._shmFileFullPath = os.path.join(self._shmFilePath, self._shmFileName)
            self._shmFlags = shmFlags

            # See the NOTE section here: https://docs.python.org/2/library/os.html#os.open for details on shmFlags
            if self._shmFlags is None:
                self._shmFile = open(self._shmFileFullPath, 'r+b')            
                self._shm = mmap.mmap(self._shmFile.fileno(), self._shmFileSize)
            else:
                self._shmFile = os.open(self._shmFileFullPath, self._shmFlags)            
                os.ftruncate(self._shmFile, self._shmFileSize)
                self._shm = mmap.mmap(self._shmFile, self._shmFileSize, mmap.MAP_SHARED, mmap.PROT_WRITE | mmap.PROT_READ)

            # Dictionary to host reserved mem blocks
            # self._mem_slots[sequenceNo] = [Begin, End]        (closed interval)
            self._memSlots = dict()

            logging.info('Shared memory name: {0}'.format(self._shmFileFullPath))
        except:
            PrintGetExceptionDetails()
            raise
            
    def File(self):
        return self._shm

    def Filename(self):
        return self._shmFileFullPath
    
    def ReadBytes(self, memorySlotOffset, memorySlotLength):
        try:
            # This is Non-Zero Copy operation
            # self._shm.seek(memorySlotOffset, os.SEEK_SET)
            # bytesRead = self._shm.read(memorySlotLength)
            # return bytesRead

            #Zero-copy version
            return memoryview(self._shm)[memorySlotOffset:memorySlotOffset+memorySlotLength].toreadonly()

        except:
            PrintGetExceptionDetails()
            raise

    # Returns None if no availability
    # Returns closed interval [Begin, End] address with available slot
    def GetEmptySlot(self, seqNo, sizeNeeded):
        if sizeNeeded < 1:
            return None

        # round size up to multiple of PAGESIZE
        pages = (sizeNeeded + mmap.PAGESIZE - 1) // mmap.PAGESIZE
        sizeNeeded = pages * mmap.PAGESIZE

        # slots in use, in order
        sorted_used_slots = sorted(self._memSlots.values(), key=lambda slot: slot[0])
        # add a dummy entry at the end of memory
        sorted_used_slots.append((self._shmFileSize, self._shmFileSize))

        # find an available memory gap
        prevSlotEnd = -1
        for used_slot in sorted_used_slots:
            if (used_slot[0] - prevSlotEnd - 1) >= sizeNeeded:
                address = (prevSlotEnd + 1, prevSlotEnd + sizeNeeded)
                self._memSlots[seqNo] = address
                return address
            prevSlotEnd = used_slot[1]

        # No space
        return None

    def DeleteSlot(self, seqNo):
        try:
            del self._memSlots[seqNo]
            return True
        except KeyError:
            return False

    def __del__(self):
        try:
            if self._shmFile:
                if self._shmFlags is None:
                    self._shmFile.close()
                else:
                    os.close(self._shmFile)
        except:
            PrintGetExceptionDetails()
            raise

