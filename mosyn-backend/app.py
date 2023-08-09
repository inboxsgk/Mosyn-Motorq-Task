"""
TODO:

NOTES:
curl -X GET -F email=mailhere -F passwd=pass_here url
"""

import firebase_admin
import pyrebase
import json
from firebase_admin import credentials, auth, db
from flask import Flask, request, jsonify

from flask_cors import CORS

import datetime


app = Flask(__name__)
CORS(app)

cred_obj = credentials.Certificate('fb-adminsdk-config.json')
default_app = firebase_admin.initialize_app(cred_obj, {'databaseURL': 'https://mosyn-31151-default-rtdb.asia-southeast1.firebasedatabase.app/'})

pb = pyrebase.initialize_app(json.load(open('fbconfig.json')))

ref = db.reference('/')

ref.update({'wf_types': ['reimbursement', 'leave']})


def mail_conv(id):
    id = id.replace('@', '-at-')
    id = id.replace('.', '-dot-')
    return id

#Fetch all types of existing workflows
def getWfTypes():
    return ref.child('wf_types').get()

#Admin-Change role of other accounts
@app.route('/api/admRoleUpdate')
def admRoleUpdate():
    params = request.args.to_dict()
    from_id = params['id']
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[mail_conv(from_id)]['role'] == 'admin':
        target_id = params['target']
        target_role = params['t_role']
        acc_ref.update({mail_conv(target_id): {'role': target_role}})
        print("Role Updated")
        return {'success': 'true'}
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#Admin-Create new worklow type
@app.route('/api/admNewWfType')
def admNewWfType():
    params = request.args.to_dict()
    from_id = params['id']
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[mail_conv(from_id)]['role'] == 'admin':
        new_Wf = params['name']
        new_Wf_apr = str(params['aprs']).replace(' ', '').split(',')
        temp_list = list(getWfTypes())
        temp_list.append({'value': new_Wf, 'approvers': list(new_Wf_apr)})
        ref.update({'wf_types': temp_list})

        print("New Workflow Type Created")
        return {'success': 'true'}
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#Admin-Fetch metrics like total pending, approved this month/day, rejected this month/day
@app.route('/api/admDashMetrics')
def admDashMetrics():
    params = request.args.to_dict()
    from_id = params['id']
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[mail_conv(from_id)]['role'] == 'admin':
        wf_ref = ref.child('workflows')
        wf_dat = wf_ref.get()

        ret = {'total_pending': 0, 'approved_month': 0, 'approved_today':0, 'rejected_month':0, 'rejected_today':0}

        for i in wf_dat.keys():
            if wf_dat[i]['approval_status'] == 'pending':
                ret['total_pending'] += 1
            else:
                cur_dt = wf_dat[i]['dt']
                cur_dt = datetime.datetime.strptime(cur_dt, '%Y-%m-%d %H:%M:%S.%f')
                if (wf_dat[i]['approval_status'] == 'accepted') and (cur_dt.month == datetime.datetime.now().month):
                    ret['approved_month'] += 1
                elif (wf_dat[i]['approval_status'] == 'accepted') and (cur_dt.date() == datetime.datetime.now().date()):
                    ret['approved_today'] += 1
                elif (wf_dat[i]['approval_status'] == 'accepted') and (cur_dt.month == datetime.datetime.now().month):
                    ret['rejected_month'] += 1
                elif (wf_dat[i]['approval_status'] == 'rejected') and (cur_dt.date() == datetime.datetime.now().date()):
                    ret['rejected_today'] += 1

        ret['success'] = 'true'
        print("Successfully fetched the required stats")
        return ret
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#Requester-Create new Workflow request
@app.route('/api/reqNewWf')
def reqNewWf():
    params = request.args.to_dict()
    from_id = params['id']
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[mail_conv(from_id)]['role'] == 'requester':
        wf_dat_type = params['wf-type']
        wf_dat_desc = params['description']
        wf_dat_files = params['files'].replace(' ', '').split(",")
        wf_ref = ref.child('workflows')
        wf_ref.push({'dt': str(datetime.datetime.now()), 'email': mail_conv(from_id), 'workflow': wf_dat_type, 'title': wf_dat_type, 'description': wf_dat_desc, 'attachments': wf_dat_files, 'approval_status': 'pending'})

        print("Added new workflow request")
        return {'success': 'true'}
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#Requester-Fetch all requests by this requester
@app.route('/api/reqViewWf')
def reqViewWf():
    params = request.args.to_dict()
    from_id = mail_conv(params['id'])
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[from_id]['role'] == 'requester':
        wf_ref = ref.child('workflows')
        wf_list = wf_ref.get()

        rv = list()
        if wf_list != None:
            for i in wf_list.keys():
                if wf_list[i]['email'] == from_id:
                    time_this = datetime.datetime.strptime(wf_list[i]['dt'], '%Y-%m-%d %H:%M:%S.%f')
                    wf_list[i]['dt'] = str(str(time_this.date())+" at "+str(time_this.time())[:-7])
                    wf_list[i]["email"] = wf_list[i]["email"].replace("-dot-", ".").replace("-at-", "@")
                    rv.append(wf_list[i])

        del wf_list
        print("Retrieved all workflows of the user")
        return rv
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#Requester - fetch valid workflow types
@app.route('/api/reqFetchWfTypes')
def reqFetchWfTypes():
    t = getWfTypes()
    return jsonify(t)

#Approver-List all requests that are pending approval
@app.route('/api/aprViewPendingWf')
def aprViewPendingWf():
    params = request.args.to_dict()
    from_id = mail_conv(params['id'])
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[from_id]['role'] == 'approver':
        wf_ref = ref.child('workflows')
        wf_list = wf_ref.get()

        rv = list()
        wf_all_types = getWfTypes()
        for i in wf_list.keys():
            if wf_list[i]['approval_status'] == 'pending':
                for cur_type in wf_all_types:
                    if cur_type == wf_list[i]['workflow']:
                        wf_list[i]["wf_token"] = i
                        wf_list[i]["email"] = wf_list[i]["email"].replace("-dot-", ".").replace("-at-", "@")
                        rv.append(wf_list[i])

        print("Loaded all pending workflows")
        return rv
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#Approver-Status update-approve or reject a request
@app.route('/api/aprStatusUpdateWf')
def aprStatusUpdateWf():
    params = request.args.to_dict()
    from_id = params['id']
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    if acc_info[mail_conv(from_id)]['role'] == 'approver':
        wf_dat_n_status = params['new-status']
        wf_dat_token = params['wf_token']


        wf_ref = ref.child('workflows')

        cur = wf_ref.get(wf_dat_token)[0]
        cur[wf_dat_token]['approval_status'] = str(wf_dat_n_status)
        cur[wf_dat_token]['s_update_by'] = mail_conv(from_id)
        wf_ref.update({wf_dat_token: cur[wf_dat_token]})

        print("Updated workflow status")
        return {'success': 'true'}
    else:
        print("You don't have necessary permissions")
        return {'success': 'false'}

#404 error response
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return 'Resource cannot be found, check documentation', 200

#Login path using email and password
@app.route('/api/login')
def login():
    params = request.args.to_dict()
    uMail = params['email']
    uPass = params['passwd']
    acc_ref = ref.child('accounts')
    acc_info = acc_ref.get()

    try:
        user = pb.auth().sign_in_with_email_and_password(email=uMail, password=uPass)
        print(user)
        jwt = user['idToken']
        re = {"success": 'true', 'token': jwt, 'id': mail_conv(uMail)}
        re['redirect'] = "./"+str(acc_info[mail_conv(uMail)]['role'])+".html"
        return re, 200
    except:
        return {"success": 'false', 'error': 'There was an error logging in'},200


if __name__ == '__main__':
    app.run(debug=True)
