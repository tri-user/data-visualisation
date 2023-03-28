import gzip
from io import BytesIO
from flask import request
import pprint
class GzipCompress:
    def __init__(self, app, compress_level=9, minimum_size=100):
        self.app = app
        self.compress_level = compress_level
        self.minimum_size = minimum_size
        self.app.after_request(self.after_request)

    def after_request(self, response):
        self.app.logger.info("gzip started")
        accept_encoding = request.headers.get('Accept-Encoding', '')

        if response.status_code < 200 or \
           response.status_code >= 300 or \
           response.direct_passthrough or \
           len(response.get_data()) < self.minimum_size or \
           'gzip' not in accept_encoding.lower() or \
           'Content-Encoding' in response.headers:
            return response

        gzip_buffer = BytesIO()
        gzip_file = gzip.GzipFile(mode='wb', 
                                  compresslevel=self.compress_level, 
                                  fileobj=gzip_buffer)
        self.app.logger.info("gzip logger started")
        gzip_file.write(response.get_data())
        gzip_file.close()
        self.app.logger.info("gzip logger close")
        response.set_data(gzip_buffer.getvalue())
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = len(response.get_data())
        self.app.logger.info("gzip logger response")
        return response 