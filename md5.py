import hashlib
import base64

def md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return base64.b64encode(hash_md5.digest()).decode()

print(md5("D:\\data\\2022-03-08-11-55_64-8-2-2-[1]-1.csv"))
