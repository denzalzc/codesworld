from django.shortcuts import render
from django.http import JsonResponse

from barcode.writer import ImageWriter
from io import BytesIO

import json
import barcode
import qrcode
from pylibdmtx.pylibdmtx import encode
from PIL import Image, ImageDraw, ImageFont
import base64
import math


# 2D
def main2D(request):
    return render(request, 'coder2d/2Dmain.html')

def base128(request):
    return render(request, 'coder2d/base128.html')

def qr(request):
    return render(request, 'coder2d/qr.html')

def datamatrix(request):
    return render(request, 'coder2d/datamatrix.html')

#api

def base128_encode(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        text = data['text']

        writer = ImageWriter()
        writer.set_options({
                'format': 'PNG',
                'module_width': 0.2,  # ширина модуля
                'module_height': 5.0,  # высота модуля
                'quiet_zone': 6.5,  # тихая зона
                'font_size': 2,  # размер шрифта
                'text_distance': 5.0,  # расстояние текста от баркода
                'write_text': True,  # показывать текст под баркодом
                'background': 'white',  # фон
                'foreground': 'black',  # цвет баркода
        })

        barcode_instance = barcode.get_barcode_class('code128')(text, writer=writer)

        buffer = BytesIO()
        barcode_instance.write(buffer)

        buffer.seek(0, 2)
        file_size = buffer.tell()
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        buffer.close()

        size_kb = file_size / 1024
        size_mb = file_size / (1024 * 1024)

        try:
            return JsonResponse({
                'success': True,
                'image': image_base64,
                'format': 'data:image/png;base64',
                'file_size': math.floor(size_kb),
                })
        except Exception as e:
            print(e)
            return JsonResponse({'result': "SOME ERROR"})
        
def datamatrix_encode(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data['text']

    try:
        encoded = encode(text.encode('utf-8'))
        dmtx_image = Image.frombytes('RGB', (encoded.width, encoded.height), encoded.pixels)
        
        buffer = BytesIO()
        dmtx_image.save(buffer, format="PNG")
        
        buffer.seek(0, 2)
        file_size = buffer.tell()
        buffer.seek(0)
        
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        buffer.close()
        
        size_kb = file_size / 1024
        
        return JsonResponse({
            'success': True,
            'image': image_base64,
            'format': 'data:image/png;base64',
            'file_size': math.floor(size_kb),
        })
        
    except Exception as e:
        print(f"Error generating DataMatrix: {e}")
        return JsonResponse({'success': False, 'error': str(e)})

def qr_encode(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        text = data['text']

        writer = ImageWriter()
        writer.set_options({
                'format': 'PNG',
                'module_width': 0.2,  # ширина модуля
                'module_height': 5.0,  # высота модуля
                'quiet_zone': 6.5,  # тихая зона
                'font_size': 2,  # размер шрифта
                'text_distance': 5.0,  # расстояние текста от баркода
                'write_text': True,  # показывать текст под баркодом
                'background': 'white',  # фон
                'foreground': 'black',  # цвет баркода
        })

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4
        )
        qr.add_data(text)
        qr.make(fit=True)

        qr_image = qr.make_image(fill_color='black', back_color='white')

        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')

        buffer.seek(0, 2)
        file_size = buffer.tell()
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        buffer.close()

        size_kb = file_size / 1024
        size_mb = file_size / (1024 * 1024)

        try:
            return JsonResponse({
                'success': True,
                'image': image_base64,
                'format': 'data:image/png;base64',
                'file_size': math.floor(size_kb),
                })
        except Exception as e:
            print(e)
            return JsonResponse({'result': "SOME ERROR"})