# This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

import kaitaistruct
from kaitaistruct import KaitaiStruct, KaitaiStream, BytesIO


if getattr(kaitaistruct, 'API_VERSION', (0, 9)) < (0, 9):
    raise Exception("Incompatible Kaitai Struct Python API: 0.9 or later is required, but you have %s" % (kaitaistruct.__version__))

class Exfat(KaitaiStruct):
    def __init__(self, _io, _parent=None, _root=None):
        self._io = _io
        self._parent = _parent
        self._root = _root if _root else self
        self._read()

    def _read(self):
        self.boot_sector = Exfat.BootSector(self._io, self, self._root)

    class BootSector(KaitaiStruct):
        def __init__(self, _io, _parent=None, _root=None):
            self._io = _io
            self._parent = _parent
            self._root = _root if _root else self
            self._read()

        def _read(self):
            self.jump_inst = self._io.read_bytes(3)
            self.oem_name = self._io.read_u8le()
            self.must_be_zero = self._io.read_bytes(53)
            self.partition_offset = self._io.read_u8le()
            self.volume_length = self._io.read_u8le()
            self.fat_off_set = self._io.read_u4le()
            self.fat_length = self._io.read_u4le()
            self.cluster_heap_offset = self._io.read_u4le()
            self.cluster_count = self._io.read_u4le()
            self.first_cluster_root_dir = self._io.read_u4le()
            self.vol_serial_number = self._io.read_u4le()
            self.file_system_revision = self._io.read_u2le()
            self.volume_flags = self._io.read_u2le()
            self.bytes_per_sector_shift = self._io.read_u1()
            self.number_of_fats = self._io.read_u1()
            self.dirve_select = self._io.read_u1()
            self.percent_in_use = self._io.read_u1()
            self.reserved = self._io.read_bytes(7)
            self.boot_code = self._io.read_bytes(390)
            self.boot_signature = self._io.read_u2le()



