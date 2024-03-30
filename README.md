# unfollowed.lol Google Extension and Server

## Server

We have a `User` model with `followers`, `following`, `unfollowers`, and `fans` (people who you don't follow back). This means that each one of these is basically lists of `Users` inside of them. 

For example, if Bob followed Alice, Bob's Following Model would comprise the Alice `User` **Object**.

There are some other changes that were made in this PR as well:
- changing the name from unfollowers to fans
- connecting the extension to the backend

### Setup Server

**Install all the requirements in your local machine or venv**
If you're using an venv, please run this command first to activate it:
```
source venv/bin/activate
```
Install the requirements
```
pip install -r requirements.txt
```

**Be sure to run your docker server first and to reload your Google Extension**
```
docker-compose up # or through docker desktop
```

**You need to run the server first by running this, it should open up in localhost**
```
python3 manage.py runserver
```

**If you made changes to the database or if this is the first time you set up the server,
migrate the database changes to the docker PostgreSQL database**

```py
python3 manage.py makemigrations server
python3 manage.py migrate server
```


