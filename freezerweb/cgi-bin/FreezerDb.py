# Database class

import MySQLdb

class FreezerDb():
    def __init__(self, user, passwd = '', host = 'localhost', db = 'freezers'):
        self.usr = user
        self.pwd = passwd
        self.hst = host
        self.db  = db

    def _query(self, query_string):
        try:
            self.conn = MySQLdb.connect(host   = self.hst, 
                                        user   = self.usr,
                                        passwd = self.pwd,
                                        db     = self.db)
            self.db = self.conn.cursor()
        except:
            raise Exception('Could Not Connect to Database')
        try:
            self.db.execute(query_string)
            return self.db.fetchall()
        except:
            raise Exception('Malformed Query: %s' % query_string)

    def get_pressure(self, num_values):
   #     query = 'SELECT analog0, analog1, timestamp FROM pressure ORDER BY timestamp DESC LIMIT %s;' % num_values
        query = 'SELECT analog0 * 0.05 as topP, analog1 * 0.05 as lowerP, timestamp FROM pressure where analog0>10 and analog1>10 ORDER BY timestamp DESC LIMIT %s;' % num_values

        values = []
        dates = []
        for row in self._query(query):
            dates.append(row[2])
            values.append([row[0], row[1]])
        return values, dates


