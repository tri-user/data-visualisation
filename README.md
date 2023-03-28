#  Data Visualization

Web application that will visualize structured binary data using templates. 


To start the Flask and React app, the end-user first needs to make sure that both Flask and React are installed on to the system. Then, navigate to the root directory of the project using a terminal. In this directory, end-users will see two subdirectories named "frontend" and "backend".

To start the Flask server, end-users should navigate to the "backend" directory and run the command "python main.py". This will start the server on the default port 5000.

To start the React app, end-users should navigate to the "client" directory and run the command "npm start". This will start the app on the default port 3000.

End-users should then open their browser and navigate to "http://localhost:3000" on local and the assigned url if on the server to access the app. Once the app is loaded, end-users can upload a file to view its hex data in the hex viewer.

To configure the endpoint of the backend server, end-users can access the keys.js file in the frontend and set the value of END_POINT to the appropriate URL. By default, the value is set to http://127.0.0.1:5000, which corresponds to the local development server. However, for deployment in production environments, end-users should update the value of END_POINT to the URL of the deployed backend server. This can be done by opening the keys.js file in a text editor and modifying the END_POINT value to the desired URL.
