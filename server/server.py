import asyncio  # package: asyncio
import serial  # package: pyserial
import sys
import websockets  # package: websockets

from dataclasses import dataclass

IP_ADDRESS = '172.17.15.152'
SERVER_PORT = 80
IS_BOARD_ADAFRUIT = False
BOARD_PORT = '/dev/ttyACM3' if IS_BOARD_ADAFRUIT else '/dev/ttyUSB0'
DEBUG = True



async def handler(websocket, path):
    serial_reader = serial.Serial(
        port=BOARD_PORT,
        baudrate = 9600,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS,
        timeout=1
    )

    init_connection_received_message = await websocket.recv()
    if DEBUG:
        print(f"Received: {init_connection_received_message}")

    while 1:
        try:
            flowmeter_serial_data = serial_reader.readline().decode('utf8')
            if DEBUG:
                print(f"send {flowmeter_serial_data}")
        except UnicodeDecodeError:
            flowmeter_serial_data = '1.11'

        try:  
            await websocket.send(flowmeter_serial_data)
        except serial.serialutil.SerialException:
            init_connection_received_message = await websocket.recv()
 
while 1:
    try:
        start_server = websockets.serve(handler, IP_ADDRESS, SERVER_PORT)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()
    except serial.serialutil.SerialException:
        pass