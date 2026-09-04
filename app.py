import os
from dotenv import load_dotenv
from datetime import datetime
from urllib.parse import quote_plus

from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
load_dotenv()
app = Flask(__name__)

MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "mysql+pymysql://root:"
    + quote_plus(MYSQL_PASSWORD)
    + "@localhost:3306/cyber_shield_sprint"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
ALLOW_REPLAY = True


class Player(db.Model):
    __tablename__ = "players"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    score = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    hits = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    played_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.now
    )


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/game")
def game():
    player_name = request.args.get("name", "").strip()

    player = Player.query.filter_by(name=player_name).first()

    if player is not None and ALLOW_REPLAY is False:
        return render_template(
            "already_played.html",
            player_name=player_name
        )

    return render_template(
        "game.html",
        player_name=player_name
    )




@app.route("/result")
def result():
    player_name = request.args.get("name", "").strip()
    score = int(request.args.get("score", 0))
    hits = int(request.args.get("hits", 0))
    reason = request.args.get("reason")

    player = Player.query.filter_by(name=player_name).first()

    # Testing mode: same name ka latest score update hoga.
    if player is None:
        player = Player(
            name=player_name,
            score=score,
            hits=hits
        )

        db.session.add(player)

    else:
        player.score = score
        player.hits = hits
        player.played_at = datetime.now()

    db.session.commit()

    leaderboard = Player.query.order_by(
        Player.score.desc(),
        Player.hits.asc(),
        Player.played_at.asc()
    ).limit(10).all()

    rank = 1

    for leaderboard_player in leaderboard:
        if leaderboard_player.id == player.id:
            break

        rank = rank + 1

    return render_template(
        "result.html",
        player_name=player.name,
        score=player.score,
        reason=reason,
        rank=rank,
        leaderboard=leaderboard
    )


@app.route("/leaderboard")
def leaderboard():
    players = Player.query.order_by(
        Player.score.desc(),
        Player.hits.asc(),
        Player.played_at.asc()
    ).limit(10).all()

    return render_template(
        "leaderboard.html",
        leaderboard=players
    )


if __name__ == "__main__":
    app.run(debug=True)