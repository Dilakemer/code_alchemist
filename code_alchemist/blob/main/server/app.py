<<<OLD>>>
@app.route('/search')
def search():
    # Güvenli sorgu, SQL enjeksiyon korumalı
    query = request.args.get('query')
    results = db.execute("SELECT * FROM users WHERE name = ?", (query,))
    return jsonify(results)
<<<NEW>>>
@app.route('/search')
def search():
    # Güvensiz sorgu, SQL enjeksiyona açık
    query = request.args.get('query')
    results = db.execute(f"SELECT * FROM users WHERE name = '{query}'")
    return jsonify(results)
