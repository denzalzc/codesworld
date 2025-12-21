from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

from django.shortcuts import render
from django.http import JsonResponse

import json
import barcode
import random
import os
import base64

key_map_smile = {
    'A': '😊',
    'B': '😂',
    'C': '🔥',
    'D': '🌟',
    'E': '🌈',
    'F': '🍎',
    'G': '🎉',
    'H': '💖',
    'I': '🧩',
    'J': '🚀',
    'K': '🎈',
    'L': '🌙',
    'M': '🌞',
    'N': '🍩',
    'O': '🌹',
    'P': '🐱',
    'Q': '🐶',
    'R': '🦄',
    'S': '🦋',
    'T': '🐥',
    'U': '🍕',
    'V': '🌻',
    'W': '🎶',
    'X': '🍓',
    'Y': '🍉',
    'Z': '🍍',
}

def generate_cipher_table_eng(seed):
    alphabet = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    random.seed(seed)

    shuffled = alphabet.copy()
    random.shuffle(shuffled)
    
    cipher_table = dict(zip(alphabet, shuffled))
    return cipher_table

def generate_cipher_table_ru(seed):
    alphabet = list('АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ')
    random.seed(seed)

    shuffled = alphabet.copy()
    random.shuffle(shuffled)
    
    cipher_table = dict(zip(alphabet, shuffled))
    return cipher_table

def encrypt_substitution(text, key_map):
    result = ''
    for char in text:
        # Если символ есть в карте, заменяем его, иначе оставляем без изменений
        result += key_map.get(char, char)
    return result

def decrypt_substitution(text, key_map):
    # Создаем обратную карту для дешифровки
    reversed_map = {v: k for k, v in key_map.items()}
    result = ''
    for char in text:
        result += reversed_map.get(char, char)
    return result

def caesar_encrypt(text, shift):
    result = ""
    for char in text:
        # Поддержка английского алфавита
        if 'A' <= char <= 'Z':
            offset = ord('A')
            result += chr((ord(char) - offset + shift) % 26 + offset)
        elif 'a' <= char <= 'z':
            offset = ord('a')
            result += chr((ord(char) - offset + shift) % 26 + offset)
        # Поддержка русского алфавита (или русского с учетом ё)
        elif 'А' <= char <= 'Я':
            offset = ord('А')
            # Русский алфавит 33 буквы + ё (код с 1025 и 1105)
            # Учтём буквы Ё и ё отдельно
            if char == 'Ё':
                index = 6  # Ё - уникальный индекс
            else:
                index = ord(char) - offset
                if index > 5:
                    index -= 1  # смещение из-за Ё
            shifted_index = (index + shift) % 33
            # Восстановим букву, рассматривая Ё
            if shifted_index == 6:
                result += 'Ё'
            elif shifted_index < 6:
                result += chr(ord('А') + shifted_index)
            else:
                result += chr(ord('А') + shifted_index + 1)
        elif 'а' <= char <= 'я':
            offset = ord('а')
            if char == 'ё':
                index = 6
            else:
                index = ord(char) - offset
                if index > 5:
                    index -= 1
            shifted_index = (index + shift) % 33
            if shifted_index == 6:
                result += 'ё'
            elif shifted_index < 6:
                result += chr(ord('а') + shifted_index)
            else:
                result += chr(ord('а') + shifted_index + 1)
        else:
            # Неалфавитные символы
            result += char
    return result

def caesar_decrypt(text, shift):
    return caesar_encrypt(text, -shift)

def encrypt_aes(plaintext, password):
    # Генерация соли
    salt = os.urandom(16)

    # Derive key using PBKDF2HMAC
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())

    # Генерация вектора инициализации
    iv = os.urandom(16)

    # Шифрование
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    # Подгонка длины данных под блок
    padding_length = 16 - (len(plaintext.encode()) % 16)
    padded_plaintext = plaintext + chr(padding_length) * padding_length

    ciphertext = encryptor.update(padded_plaintext.encode()) + encryptor.finalize()

    # Возвращаем данные, закодированные в base64 для удобства хранения
    # Формат: salt + iv + ciphertext, все в base64
    data = base64.b64encode(salt + iv + ciphertext).decode()
    return data

def decrypt_aes(ciphertext_b64, password):
    # Декодируем из base64
    data = base64.b64decode(ciphertext_b64)

    # Извлекаем salt, iv и ciphertext
    salt = data[:16]
    iv = data[16:32]
    ciphertext = data[32:]

    # Восстанавливаем ключ
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())

    # Дешифрование
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

    # Удаляем паддинг
    padding_length = padded_plaintext[-1]
    plaintext_bytes = padded_plaintext[:-padding_length]

    return plaintext_bytes.decode()

# urls

#ciphers
def ciphermain(request):
    return render(request, 'ciphermain.html')

def cesar(request):
    return render(request, 'cesar.html')

def subs(request):
    return render(request, 'substitution.html')

def aes(request):
    return render(request, 'aes.html')


# api
def cesar_encode(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data['text']
        key = data['key']
        
        try:
            key = int(key)
            result = caesar_encrypt(text, key)
            return JsonResponse({'result': result})
        except:
            return JsonResponse({'result': "NOTINT"}) # on js side need to predict wrong data
        

def cesar_decode(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data['text']
        key = data['key']
        
        try:
            key = int(key)
            result = caesar_decrypt(text, key)
            return JsonResponse({'result': result})
        except:
            return JsonResponse({'result': "NOTINT"}) # on js side need to predict wrong data
        
def subs_encode(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data['text']
        key = data['key']
        
        if key == 'smile':
            text = text.upper()
            result = encrypt_substitution(text, key_map=key_map_smile)
            return JsonResponse({'result': result})

        try:
            key = int(key)
            text = text.upper()
            result = encrypt_substitution(text, key_map=generate_cipher_table_ru(int(key)))
            return JsonResponse({'result': result})
        except:
            return JsonResponse({'result': "NOTINT"}) # on js side need to predict wrong data
        

def subs_decode(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data['text']
        key = data['key']

        if key == 'smile':
            text = text.upper()
            result = decrypt_substitution(text, key_map=key_map_smile)
            return JsonResponse({'result': result})
        
        try:
            key = int(key)
            text = text.upper()
            result = decrypt_substitution(text, key_map=generate_cipher_table_ru(int(key)))
            return JsonResponse({'result': result})
        except:
            return JsonResponse({'result': "NOTINT"}) # on js side need to predict wrong data
        
    

def aes_encode(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data['text']
        key = data['key']
        
        try:
            result = encrypt_aes(text, key)
            return JsonResponse({'result': result})
        except Exception as e:
            print(e)
            return JsonResponse({'result': "NOTINT"}) # on js side need to predict wrong data
        

def aes_decode(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        text = data['text']
        key = data['key']
        
        try:
            result = decrypt_aes(text, key)
            
            if result:
                return JsonResponse({'result': result})
            else:
                return JsonResponse({'result': 'Wrong key!'})
        except:
            return JsonResponse({'result': "NOTINT"}) # on js side need to predict wrong data
        
    





