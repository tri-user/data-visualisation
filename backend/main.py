from contextlib import nullcontext
from enum import Enum
from importlib.resources import path
from pickle import FALSE, TRUE
from classes import jpeg, mbr_partition_table, zip, exfat
import flask
import logging
from flask import request, jsonify, make_response, json
from flask_cors import CORS, cross_origin
from kaitaistruct import KaitaiStream, BytesIO, KaitaiStruct

from hdfs import InsecureClient
import os
import uuid
# import asyncio
# import json
# import tempfile
from pprint import pprint
import collections.abc
# import gzip
from gzip_compress import GzipCompress
import hashlib
import time
import struct
import variables

logging.basicConfig(level="DEBUG")
app = flask.Flask(__name__)
cors = CORS(app, origins=['*'])
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024
app.config['JSON_SORT_KEYS'] = False
GzipCompress(app)

# app.config['TESTING'] = True
# app.config['DEBUG'] = True
# app.config['ENV'] = 'development'

@app.route('/health', methods=['GET'])
def get_health():
    app.logger.info('health api')
    return jsonify({'body': 'helo world, health is okay (y)', 'status': 200})


@app.route('/api/hex', methods=['POST'])
@cross_origin()
def api_hex():
    if 'file' not in request.files:
        return jsonify({'status': 400, 'error': 'Attribute file is mandatory'})

    content = request.files['file'].read()
    data = content.hex()
    return jsonify({'body': data, 'status': 200})

@app.route('/api/hdfs', methods=['GET'])
@cross_origin()
def api_hdfs_get():
    app.logger.info("/api/hdfs called")
    args = request.args

    if not args.get('path'):
        return jsonify({'status': 400, 'error': 'No file path provided'}) 
    if not args.get('chunk_number') or int(args.get('chunk_number')) < 0:
        return jsonify({'status': 400, 'error': 'Invalid chunk number or not provided'})
    try:
        hex_temp_path = get_temp_file_fldr() + unique_hash(args.get('path')) + '.txt'
        data = read_from_file(hex_temp_path)
        if data == '':
            # Setup the client so you can connect (must be on the VPN for this)
            hdfs_client = get_hdfs_client()
            local_file_path = hdfs_download(args.get('path'), hdfs_client)
            with open(local_file_path, "rb") as file_b:
                fb = file_b.read()
            data = fb.hex()
            write_to_file(data, hex_temp_path)
            remove_file(local_file_path)
        
        chunk_size = variables.chunk_size; #int(args.get('chunk_size')) # get chunk_size from request
        chunks = chunk_data(data, chunk_size) # chunk data based on chunk_size
        chunks_len = len(chunks)
        
        chunk_number = int(args.get('chunk_number')) # get chunk_number from request
        has_more = (chunk_number+1) != (chunks_len)
        
        if chunk_number < chunks_len:
            json_object = {'body': {'hex': chunks[chunk_number]}, 'has_more':has_more,  'status': 200}
        else:
            json_object = {'body': {'hex': ''}, 'has_more':has_more,  'status': 200}
               
        if not has_more or args.get('chunk_limit_reached') == 'true':
            remove_file(hex_temp_path)

        return jsonify(json_object)
    except Exception as e:
        app.logger.info("/api/hdfs error occured")
        app.logger.error(e)
        return jsonify({'status': 400, 'error': 'There was an error, please try again.'})

def unique_hash(value):
    sha256 = hashlib.sha256()
    sha256.update(value.encode())
    return sha256.hexdigest()
    
def write_to_file(data, file_path):
    with open(file_path, 'w') as f:
        f.write(data)

def read_from_file(file_path):
    try:
        with open(file_path, 'r') as f:
            data = f.read()
        return data
    except: 
        return ""

def chunk_data(data, chunk_size):
    chunks = [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
    return chunks

def hdfs_download(path, hdfs_client):
    hdfs_path = path
    filename = os.path.basename(hdfs_path).split('.')
    ext = filename[1] if (len(filename)>1) else ''
    temp_filename = str(uuid.uuid4()) + '.' + ext
    file_path = get_temp_file_fldr() + temp_filename

    # # Setup the client so you can connect (must be on the VPN for this)
    hdfs_client = get_hdfs_client()
    # hdfs_client.status(path)['type'] == 'FILE' # add a check here to download only files and not folders
    hdfs_client.download(hdfs_path, file_path, n_threads= 25)
    return file_path

def remove_file(path):
    os.remove(path)
        
@app.route('/api/hdfs', methods=['POST'])
@cross_origin()
def api_hdfs():
    args = request.form
    if not args.get('path') :
        return jsonify({'status': 400, 'data': 'No hdfs upload file or file path provided'})
    if 'file' not in request.files:
        return jsonify({'status': 400, 'data': 'Attribute file is mandatory'})    
    try:
        hdfs_path = args.get('path')
        hdfs_client = get_hdfs_client()
        temp_filename = 'screenshot-' + str(uuid.uuid4()) + '.jpg'
        file = request.files['file']
        file.save(get_temp_file_fldr() + temp_filename)
        file_path = get_temp_file_fldr() + temp_filename
        hdfs_path = os.path.split(hdfs_path)[0] + '/' + variables.HDFS_APP_FOLDER
        hdfs_client.makedirs(hdfs_path)
        hdfs_client.upload(hdfs_path, file_path)
        remove_file(file_path)
        return jsonify({'body': {'temp':temp_filename, 'hex':'a', 'kaitai': 'kaitai'}, 'status': 200})
    except Exception as e:
        return jsonify({'status': 400, 'error': str(e)})

@app.route('/api/kaitai', methods=['POST'])
@cross_origin()
def api_kaitai():
    try:    
        ext = request.form['ext'] 
        if ('file' not in request.files and request.form['isHdfs'] == 'false') or (request.form['isHdfs'] == 'true' and not request.form['tempHdfsFile']) :
            return jsonify({'status': 401, 'error': 'Attribute file is mandatory'})
        
        if request.form['isHdfs'] == 'true':
            hdfs_client = get_hdfs_client()
            # hdfs_client.status(path)['type'] == 'FILE'
            file_path = hdfs_download(request.form['tempHdfsFile'], hdfs_client)
            with open(file_path, "rb") as file_b:
                content = file_b.read()
            remove_file(file_path)
        else:    
            content = request.files['file'].read()
        # data = _get_kaitai_struct(content, ext)
        kaitaiObj = parser(content, ext)
        data = convert_class_to_list_new(kaitaiObj, ext)
        return jsonify({'body': data, 'status': 200})
    except Exception as e:
        return jsonify({'error': 'This is not a valid file for this format', 'status': 501})

@app.route('/api/table', methods=['POST'])
@cross_origin()
def get_table():
    try: 
        ext = request.form['ext'] 
        if ('file' not in request.files and request.form['isHdfs'] == 'false') or (request.form['isHdfs'] == 'true' and not request.form['tempHdfsFile']) :
            return jsonify({'status': 401, 'error': 'Attribute file is mandatory'})
        
        if request.form['isHdfs'] == 'true':
            hdfs_client = get_hdfs_client()
            # hdfs_client.status(path)['type'] == 'FILE'
            file_path = hdfs_download(request.form['tempHdfsFile'], hdfs_client)
            with open(file_path, "rb") as file_b:
                content = file_b.read()
            remove_file(file_path)
        else:    
            content = request.files['file'].read()
        html = _create_byte_table(content, ext)

        hdfs_path = request.form['tempHdfsFile']
        hdfs_client = get_hdfs_client()
        filename = os.path.basename(hdfs_path)

        timestamp = time.time()
        unique_id = hex(int(timestamp))[2:]
        temp_filename = filename + '__' + unique_id + '.html'
        # file = request.files['file']
        
        html_path = get_temp_file_fldr() + temp_filename
        
        write_table_to_html(html, html_path)
        hdfs_path = os.path.split(hdfs_path)[0] + '/' + variables.HDFS_APP_FOLDER
        hdfs_client.makedirs(hdfs_path)
        hdfs_client.upload(hdfs_path, html_path)
        remove_file(html_path)
        
        return jsonify({'body': html, 'status': 200})
        # return json.dumps(data)
    except Exception as e:
        pprint(str(e))
        return jsonify({'status': 400, 'error': str(e)})

def build_segment_list_jpg(jpg):
    # return
    segment_list = []
    for seg in jpg["segments"]:
        segment = {}
        segment["magic"] = seg["magic"]
        segment["marker"] = seg["marker"]
        if "length" in seg:
            segment["length"] = seg["length"]
        if "data" in seg:  
            data = {}
            # if type(seg["data"]) is dict:
            #     for key, value in seg["data"].items():
            #         data[key] = value
            # elif type(seg["data"]) is list:
            #     data = seg["data"]
            # else:
            #     data = seg["data"]
            segment["data"] = seg["data"]
            # for key, value in seg["data"]:
            #     data[key] = value
            # segment["data"] = seg["data"]
        if "image_data" in seg: 
            segment['image_data'] = seg['image_data']
        segment_list.append(segment)
    return segment_list
def object_properties_to_list(obj, with_private=False, ext=None):
    properties = [prop for prop in dir(obj) if not callable(getattr(obj, prop)) and not prop.startswith("__") and (with_private or not prop.startswith("_"))]
    if ext is None:
        return properties
    return sort_labels(properties, ext)
    return properties

def is_iterable(element):
    return isinstance(element, collections.abc.Iterable) and not isinstance(element, (str, int, float))

def _create_byte_table(content, ext):
    kaitaiObj = parser(content, ext)
    data =  convert_class_to_list(kaitaiObj, ext)
    # return data
    html = ''
    if ext == 'jpg' or ext == 'jpeg':
        jpg_list = []
        jpg_list.append(['name', 'marker', 'length', 'description'])
        htmls = ''
        for i in data['segments']:
            jpg_list.append(
                [
                    i['marker']['name'],
                    hex(i['magic'][0]),
                    (i.get('length', '')),
                    get_marker_name(i['marker']['name'])
                ]
            )
            any_other_data = get_filtered_keys(i)
            if any_other_data:
                for v in any_other_data:
                    htmls = htmls + (html_table(i[v], v))  + '<hr/>' 
        main_html = list_to_html_table(jpg_list)
        html = main_html + htmls
    elif ext == 'mbr':
        mbr_list = []
        mbr_list.append(['offset', 'description', 'length'])
        bootstrap_code_offset = '0x{:02x}'.format(data['bootstrap_code'][0]) + '...' + '0x{:02x}'.format(data['bootstrap_code'][-1])
        mbr_list.append([bootstrap_code_offset, 'Bootstrap code area', len(data['bootstrap_code'])])


        # calculate partitions length by converting all the values in the array into byte string, if the no is greater than 255 then use int_to_bytes_le
        for i, partition in enumerate(data['partitions']):
            partition # do it for all partitions
            partition_len = (sum_mbr_child_values(partition))
            desc = 'Partition entry ' + str(i+1)
            mbr_list.append([str(hex(partition['status'])), desc, partition_len])
        mbr_list.append([str(hex(data['boot_signature'][0])), 'Boot Signature', sum_mbr_child_values(data['boot_signature'])])
        # lastly show boot signature row
        return list_to_html_table(mbr_list)
    elif ext == 'zip':
        mbr_list = []

        
        mbr_list.append(['name', 'description', 'value'])
        local_file_header_name = 'Local file header'

        local_file_header_version = data.get('sections', [{}])[0].get('LocalFile.body', {}).get('LocalFileHeader.header', {}).get('version', None)
        mbr_list.append([local_file_header_name, 'Version', local_file_header_version])
        
        local_file_header_compression = data.get('sections', [{}])[0].get('LocalFile.body', {}).get('LocalFileHeader.header', {}).get('compression_method', {}).get('name', None)
        mbr_list.append([local_file_header_name, 'Compression method', local_file_header_compression])
        
        crc32 = data.get('sections', [{}])[0].get('LocalFile.body', {}).get('LocalFileHeader.header', {}).get('crc32', None)
        mbr_list.append([local_file_header_name, 'crc-32', crc32])

        compressed_size = data.get('sections', [{}])[0].get('LocalFile.body', {}).get('LocalFileHeader.header', {}).get('len_body_compressed', None)
        mbr_list.append([local_file_header_name, 'Compressed size', compressed_size])

        uncompressed_size = data.get('sections', [{}])[0].get('LocalFile.body', {}).get('LocalFileHeader.header', {}).get('len_body_uncompressed', None)
        mbr_list.append([local_file_header_name, 'Uncompressed size', uncompressed_size])


        central_dir_name = 'Central Dir'

        central_dir_version = data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('version_needed_to_extract', None)
        mbr_list.append([central_dir_name, 'Version needed to extract', central_dir_version])

        central_dir_crc32 = data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('crc32', None)
        mbr_list.append([central_dir_name, 'crc-32', central_dir_crc32])

        central_dir_compressed_size = data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('len_body_compressed', None)
        mbr_list.append([central_dir_name, 'Compressed size', central_dir_compressed_size])

        central_dir_uncompressed_size = data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('len_body_uncompressed', None)
        mbr_list.append([central_dir_name, 'Uncompressed size', central_dir_uncompressed_size])

        central_dir_file_name_len = (data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('len_file_name', None))
        mbr_list.append([central_dir_name, 'Filename length', central_dir_file_name_len])
        
        central_dir_offset = (data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('ofs_local_header', None))
        mbr_list.append([central_dir_name, 'Offset from local header', central_dir_offset])
        
        central_dir_file_name = (data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('file_name', None))
        mbr_list.append(['Filename', 'name of the file', central_dir_file_name])

        end_central_dir_name = 'End of central Dir'

        central_dir_entries = data.get('sections', [{}])[1].get('EndOfCentralDir.body', {}).get('num_central_dir_entries_total', None)
        mbr_list.append([end_central_dir_name, 'Entries in central dir', central_dir_entries])

        central_dir_size = data.get('sections', [{}])[1].get('CentralDirEntry.body', {}).get('len_central_dir', None)
        mbr_list.append([end_central_dir_name, 'Size of central dir', central_dir_size])

        end_central_dir_offset = data.get('sections', [{}])[2].get('EndOfCentralDir.body', {}).get('ofs_central_dir', None)
        mbr_list.append([end_central_dir_name, 'Offset from central dir', end_central_dir_offset])

        return list_to_html_table(mbr_list)

    elif ext == 'exfat':
        exfat_list = []
        exfat_list.append(['name', 'description', 'offset', 'size'])
        
        table_list = {
            'oem_name': {'len': 8, 'display_text': 'File system name', 'display_desc': 'File system name'},
            'partition_offset': {'len': 8, 'display_text': 'Partition offset', 'display_desc': 'Location of the start of the partition'},
            'volume_length': {'len': 8, 'display_text': 'Volume length', 'display_desc': 'Total number of Sectors'},
            'fat_off_set': {'len': 4, 'display_text': 'FAT offset', 'display_desc': 'Sector address of 1st FAT'},
            'fat_length': {'len': 4, 'display_text': 'FAT length', 'display_desc': 'Size of FAT in sectors'},
            'cluster_heap_offset': {'len': 4, 'display_text': 'Cluster offset', 'display_desc': 'Starting sector of cluster heap'},
            'cluster_count': {'len': 4, 'display_text': 'Cluster count', 'display_desc': 'Number of clusters'},
            'first_cluster_root_dir': {'len': 4, 'display_text': 'Root directory', 'display_desc': 'First cluster of root directory'},
            'volume_flags': {'len': 2, 'display_text': 'Volume flags', 'display_desc': 'Volume flags'},
            'bytes_per_sector_shift': {'len': 1, 'display_text': 'Bytes per Sector', 'display_desc': 'Count of bytes per sector'},
            'number_of_fats': {'len': 1, 'display_text': 'Number of FATs', 'display_desc': 'Number of FATs'}
            }

        offset = 0
        for boot_sector in data['BootSector.boot_sector']:
            if (boot_sector in table_list):
                if table_list[boot_sector]['len'] > 1:
                    curr_len = len(int_to_bytes_le(data['BootSector.boot_sector'][boot_sector], table_list[boot_sector]['len']))
                else:
                    curr_len = len(int_to_bytes_le(data['BootSector.boot_sector'][boot_sector], table_list[boot_sector]['len'])) // 2
                exfat_list.append([table_list[boot_sector]['display_text'], table_list[boot_sector]['display_desc'], offset, curr_len])
            else:
                curr_len = sum_mbr_child_values(data['BootSector.boot_sector'][boot_sector])
            offset += curr_len

        return list_to_html_table(exfat_list)
    else:
        return data
        for v in data:
            pprint(v)
            html = html + (html_table(i[v], v))  + '<hr/>' 
    return html

def sum_mbr_child_values(data):
    total = 0
    if isinstance(data, list):
        for item in data:
            if (item>255):
                byte = 4 
            else:
                byte = 1
            total += byte
    if isinstance(data, dict):        
        for key, value in data.items():
            if key == 'sector' or key == 'cylinder':
                continue
            if isinstance(value, dict):
                total += sum_mbr_child_values(value)
            elif isinstance(value, int):
                if (value>255):
                    byte = int_to_bytes_le(value, 4)
                else:
                    byte = 1
                total += byte
    # print(total)
    return total

def int_to_bytes_le(n, length):
    if length < 2:
        return '{:02X}'.format(n)
    return struct.pack('<' + 'H' * (length // 2), *(n >> i & 0xffff for i in range(0, length * 8, 16)))

def int_to_bytes_le_n(num):
    byte_str = num.to_bytes((num.bit_length() + 7) // 8, 'little')
    return ''.join(f"{b:02x}".upper() for b in byte_str)

def write_table_to_html(table_string, filename):
    file_html = open(filename, "w")
    file_html.write("<html>\n<body>\n")
    file_html.write(table_string)
    file_html.write("\n</body>\n</html>")
    file_html.close()

def html_table(data, header=None):
    table = "<table style='border: 1px solid black; border-collapse: collapse; padding: 5px'>"
    if header:
        table += "<tr><th style='border: 1px solid black; padding: 5px'>" + header + "</th></tr>"
    for key, value in data.items():
        table += "<tr><td style='border: 1px solid black; padding: 5px'>" + key + "</td><td style='border: 1px solid black; padding: 5px'>" + str(value) + "</td></tr>"
    table += "</table><br/><br/>"
    return table

def get_filtered_keys(ar):
    keys_to_remove = ["marker", "magic", "length", "data", "image_data"]
    return [key for key in ar.keys() if key not in keys_to_remove]

def get_marker_name(name):
    marker_map = {
        "soi": "start of image",
        "app": "application-specific marker",
        "dqt": "define quantization table",
        "sof": "start of frame",
        "dht": "define huffman table",
        "sos": "start of scan",
    }
    abbrev = name[:3].lower()
    if abbrev in marker_map:
        return marker_map[abbrev]
    return None

def list_to_html_table(data):
    table = "<table style='border: 1px solid black; border-collapse: collapse; padding: 5px;'>"
    for row in data:
        table += "<tr>"
        for cell in row:
            table += "<td style='border: 1px solid black; padding: 5px;'>" + str(cell) + "</td>"
        table += "</tr>"
    table += "</table><br/><br/>"
    return table

def kaitai_definations_validations(field, ext):
    if ext not in variables.kaitai_definitions:
        return False

    if field not in variables.kaitai_definitions[ext]:
        return False

    if "len" not in variables.kaitai_definitions[ext][field]:
        return False

    if "endian" not in variables.kaitai_definitions[ext][field]:
        return False
    return True

def convert_to_bytes(value, field, ext):
    try:
        if isinstance(value, bytes):
            return value.hex()

        if isinstance(value, str):
            return value.encode().hex()

        if not isinstance(value, int) and all(isinstance(i, int) for i in value):
            byte_str = bytes(value)
            return byte_str.hex()

        if not kaitai_definations_validations(field, ext):
            return ''

        length = variables.kaitai_definitions[ext][field]["len"] if variables.kaitai_definitions[ext][field]["len"] else 1
        endian = variables.kaitai_definitions[ext][field]["endian"]

        # Convert the integer to bytes
        value_bytes = value.to_bytes((value.bit_length() + 7) // 8, byteorder='big')
        
        # Pad the bytes to the specified length
        padded_bytes = value_bytes.rjust(length, b'\x00')
        
        # Convert to the correct endianness if needed
        if endian == 'little':
            padded_bytes = padded_bytes[::-1]
        return padded_bytes.hex()
    except Exception as e:
        app.logger.info("convert_to_bytes")
        app.logger.error(e)
        return value

def convert_class_to_list(obj, ext=None):
    class_desc = dict()
    prop_list = object_properties_to_list(obj, False, ext)
    for element in prop_list:
        element_value = getattr(obj, element)
        iterable = is_iterable(element_value)
        if(iterable):
            # if all(isinstance(i, int) for i in element_value):
            #     class_desc[element] = _get_instance(element_value, False)
            # else:
                element_value_iterable = []
                for v in element_value:
                    if isinstance(v, KaitaiStruct):
                        val = convert_class_to_list(v, ext)
                        element_value_iterable.append(val if val else '')
                    else:
                        element_value_iterable.append(v)
                        # print('not an object')
                class_desc[element] = element_value_iterable            
        elif isinstance(element_value, KaitaiStruct):
            # key_name = element if not isinstance(element, int) else type(element_value).__name__
            # class_desc[type(element_value).__name__ + '.' + str(element)] = convert_class_to_list(element_value, ext)
            class_desc[str(element)] = convert_class_to_list(element_value, ext)
        else:
            class_desc[element] = _get_instance(element_value, True)
            # print('not iterable')
    return class_desc

def convert_class_to_list_new(obj, ext=None):
    try:
        class_desc = dict()
        prop_list = object_properties_to_list(obj, False, ext)
        for element in prop_list:
            element_value = getattr(obj, element)
            iterable = is_iterable(element_value)
            if(iterable):
                if all(isinstance(i, int) for i in element_value):
                    class_desc[element] = convert_to_bytes(element_value, element, ext)
                else:
                    element_value_iterable = {}
                    i = 0
                    for v in element_value:
                        loop_key = v.marker.name if hasattr(v, 'marker') and hasattr(v.marker, 'name') else i
                        zip_section_type = {513: 'CentralDirEntry',1027: 'LocalFile',1541: 'EndOfCentralDir',2055: 'DataDescriptor'}
                        loop_key = zip_section_type[v.section_type] if hasattr(v, 'section_type') else i 
                        element_value_iterable.update({loop_key:{}})
                        if isinstance(v, KaitaiStruct):
                            val = convert_class_to_list_new(v, ext)
                            element_value_iterable[loop_key].update(val if val else '')
                        else:
                            element_value_iterable[loop_key].update(v)
                        i += 1
                    class_desc[element] = element_value_iterable            
            elif isinstance(element_value, KaitaiStruct):
                a = convert_class_to_list_new(element_value, ext)
                class_desc[str(element)] = a
            else:
                raw_value = _get_instance(element_value, enum_join = False)
                class_desc[element] = convert_to_bytes(raw_value, element, ext)
        return class_desc
    except Exception as e:
        app.logger.info("/api/hdfs error occured")
        app.logger.error(e)
        
def parser(content, ext):
    if ext == 'jpg' or ext == 'jpeg':
        return jpeg.Jpeg(KaitaiStream(BytesIO(content)))
    if ext == 'mbr':
        return mbr_partition_table.MbrPartitionTable(KaitaiStream(BytesIO(content)))
    if ext == 'zip':
        return zip.Zip(KaitaiStream(BytesIO(content)))
    if ext == 'exfat':
        return exfat.Exfat(KaitaiStream(BytesIO(content)))


def _get_non_callable_data(data, ext=None):
    non_callable_props = [a for a in dir(data) if
                          not a.startswith('__') and not a.startswith('_') and not callable(getattr(data, a))]
    if ext is None:
        return non_callable_props
    return sort_labels(non_callable_props, ext)
        


def _get_instance(item, enum_join = False):
    if isinstance(item, bytes):
        return item.hex()
    if isinstance(item, int):
        # return hex(item)[2:]
        return item 
    if isinstance(item, str):
        # return item.encode().hex()[2:]
        return item 
    if isinstance(item, Enum):
        # return hex(item.value)[2:]
        return {'value': item.value, 'name': item.name} if enum_join else item.value #hex(item.value)
    # if isinstance(item, list) or isinstance(item, dict):
    #     # byte_str = bytes(item)
    #     return byte_str.hex()
    if isinstance(item, list):
        return False    

def recursive_check(obj, ext):
    list_it = dict()
    for prop in (_get_non_callable_data(obj, ext)):
        attr = getattr(obj, prop)
        val = _get_instance(attr)
        hex_v = ''
        if isinstance(val, int):
            hex_v = hex(val)
        list_it[prop] = [str(val), hex_v]
        if (val is None):
            list_it[prop] = recursive_check(attr, ext)
    return (list_it)

def _get_kaitai_struct(content, ext):
    data = parser(content, ext)
    non_callable_data0 = _get_non_callable_data(data, ext)
    if len(non_callable_data0) > 0:
        obj0 = dict()
        for props0 in non_callable_data0:
            attrs0 = getattr(data, props0)
            instance0 = _get_instance(attrs0)
            if ext == 'exfat':
                obj0[props0] = (recursive_check(attrs0, ext))
            else:    
                if instance0 is not False and instance0 is not None:
                    obj0[props0] = instance0
                else:
                    data_list = list()
                    for item in attrs0:
                        non_callable_data1 = _get_non_callable_data(item, ext)
                        if len(non_callable_data1) > 0:
                            obj1 = dict()
                            for props1 in non_callable_data1:
                                attrs1 = getattr(item, props1)
                                instance1 = _get_instance(attrs1)
                                if instance1 is None:
                                    obj1[props1] = recursive_check(attrs1, ext)
                                elif instance1 is not False:
                                    obj1[props1] = (instance1)
                            data_list.append(obj1)
                    obj0[props0] = data_list
        return obj0


def sort_labels(raw_list, ext):
    new_list = []
    if ext in variables.kaitai_format_order:
        order = variables.kaitai_format_order[ext]
        new_list = list(filter(lambda x: x in raw_list, order)) + list(filter(lambda x: x not in order, raw_list))
        return new_list
    else:
        return raw_list

def get_temp_file_fldr():
    script_dir = os.path.dirname(__file__) #<-- absolute dir the script is in    
    return os.path.join(script_dir, 'temp/')

def get_hdfs_client():
    # Setup the client so you can connect (must be on the VPN for this)
    return InsecureClient(variables.HDFS_SEVER, user=variables.HDFS_USER)    

@app.before_first_request
def setup_folders():
    if not os.path.exists(get_temp_file_fldr()):
        os.mkdir(get_temp_file_fldr())

if __name__ == '__main__':
    app.run()
