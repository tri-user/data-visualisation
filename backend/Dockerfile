FROM python:3.8

RUN mkdir /opt/backend

ADD .  /opt/backend

WORKDIR /opt/backend

RUN pip install -r /opt/backend/requirements.txt

EXPOSE 5000

# I DONT KNOW IF THIS IS THE COMMAND THAT YOU WANT TO RUN
#ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--capture-output", "--enable-stdio-inheritance", "main:app"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout","600", "--threads","3","--capture-output", "--enable-stdio-inheritance", "main:app"]
#ENTRYPOINT ["python3", "main.py"]



