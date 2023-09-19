from PyQt5 import QtCore, QtGui, QtWidgets
from threading import Thread, current_thread
from .local_onvif import OnvifController
import time


class DialogSetupCamera(QtWidgets.QDialog):
	def __init__(self, parent):
		super(DialogSetupCamera, self).__init__()
		self.parent = parent

	def setupUi(self):
		self.setObjectName("dialog_setup_camera")
		self.resize(260, 267)
		self.buttonBox = QtWidgets.QDialogButtonBox(self)
		self.buttonBox.setGeometry(QtCore.QRect(10, 225, 241, 32))
		self.buttonBox.setOrientation(QtCore.Qt.Horizontal)
		self.buttonBox.setStandardButtons(QtWidgets.QDialogButtonBox.Cancel | QtWidgets.QDialogButtonBox.Ok | QtWidgets.QDialogButtonBox.Reset)
		self.buttonBox.setCenterButtons(True)
		self.buttonBox.setObjectName("buttonBox")
		self.label_ip = QtWidgets.QLabel(self)
		self.label_ip.setGeometry(QtCore.QRect(15, 8, 81, 16))
		self.label_ip.setObjectName("label_ip")
		self.input_ip = QtWidgets.QLineEdit(self)
		self.input_ip.setGeometry(QtCore.QRect(11, 30, 231, 20))
		self.input_ip.setObjectName("input_ip")
		self.label_port = QtWidgets.QLabel(self)
		self.label_port.setGeometry(QtCore.QRect(15, 60, 81, 16))
		self.label_port.setObjectName("label_port")
		self.input_port = QtWidgets.QLineEdit(self)
		self.input_port.setGeometry(QtCore.QRect(11, 82, 231, 20))
		self.input_port.setObjectName("input_port")
		self.input_uid = QtWidgets.QLineEdit(self)
		self.input_uid.setGeometry(QtCore.QRect(11, 132, 231, 20))
		self.input_uid.setObjectName("input_uid")
		self.label_uid = QtWidgets.QLabel(self)
		self.label_uid.setGeometry(QtCore.QRect(15, 110, 81, 16))
		self.label_uid.setObjectName("label_uid")
		self.input_pwd = QtWidgets.QLineEdit(self)
		self.input_pwd.setGeometry(QtCore.QRect(11, 182, 231, 20))
		self.input_pwd.setObjectName("input_pwd")
		self.label_pwd = QtWidgets.QLabel(self)
		self.label_pwd.setGeometry(QtCore.QRect(15, 160, 81, 16))
		self.label_pwd.setObjectName("label_pwd")

		self.retranslateUi()
		self.buttonBox.accepted.connect(self.parent.dialog_setup_ok)
		self.buttonBox.rejected.connect(self.parent.dialog_setup_cancel)
		self.buttonBox.button(QtWidgets.QDialogButtonBox.Reset).clicked.connect(self.parent.dialog_setup_reset)
		QtCore.QMetaObject.connectSlotsByName(self)

	def retranslateUi(self):
		_translate = QtCore.QCoreApplication.translate
		self.setWindowTitle(_translate("dialog_setup_camera", "Setup Camera"))
		self.label_ip.setText(_translate("dialog_setup_camera", "IP Address *"))
		self.input_ip.setPlaceholderText(_translate("dialog_setup_camera", "Enter IP address here"))
		self.label_port.setText(_translate("dialog_setup_camera", "Port"))
		self.input_port.setPlaceholderText(_translate("dialog_setup_camera", "Enter port number here"))
		self.input_uid.setPlaceholderText(_translate("dialog_setup_camera", "Enter username here"))
		self.label_uid.setText(_translate("dialog_setup_camera", "Username"))
		self.input_pwd.setPlaceholderText(_translate("dialog_setup_camera", "Enter password here"))
		self.label_pwd.setText(_translate("dialog_setup_camera", "Password"))


class ControllerWidget(QtWidgets.QWidget, Thread):

	def __init__(self, *args, **kwargs):
		super(ControllerWidget, self).__init__(*args, **kwargs)
		Thread.__init__(self)
		self.setupEmpty()
		self.ui_available = False
		self.setupUi(True)

	def setupEmpty(self):
		self.ip = ''
		self.port = ''
		self.uid = ''
		self.pwd = ''
		self.param = {}
		self.arg = {}

	def run(self):
		self.init_label.setText("Initializing Camera Control")
		if self.ip != '':
			self.setupController()
		else:
			self.set_onvif_support(False)

	def setupController(self):
		self.onvif = OnvifController(self)
		self.onvif.setup()

	def re_initialize(self):
		print("INDEX changed")
		self.setupUi(False)
		self.btn_setup_camera.hide()
		self.init_label.setText("Re-Initializing Camera Control")
		self.setupController()

	def set_onvif_support(self, x):
		print("Recieved onvif support : ",x)
		self.btn_setup_camera.show()
		if x:
			# self.init_label.hide()
			self.setupUi(True)
			self.init_label.setText("Supported")
			print("Supported")
			if self.ui_available:
				# self.btn_setup_camera.setGeometry(QtCore.QRect(49, 56, 111, 31))
				pass

		else:
			self.init_label.setText("No Onvif (PTZ) support to camera.")
			# self.btn_setup_camera.setGeometry(QtCore.QRect(250, 100, 111, 31))
			pass
			# self.init_label.setText("      No Onvif(PTZ) support.\nTrying HTTP(Native) Connection.")
			# self.setupNative()

	def set_parent(self, x):
		self.setParent(x)
		self.parent = x

	def setupParams(self, param, arg):
		self.param = param
		self.arg = arg

	# --- Button Handlers ---

	def get_speed(self):
		return self.slider_move.value(), self.slider_zoom.value()

	def zoom_in_handler(self):
		self.onvif.action("zi", self.get_speed())

	def zoom_out_handler(self):
		self.onvif.action("zo", self.get_speed())

	def move_up_handler(self):
		self.onvif.action("up", self.get_speed())

	def move_down_handler(self):
		self.onvif.action("down", self.get_speed())

	def move_left_handler(self):
		self.onvif.action("left", self.get_speed())

	def move_right_handler(self):
		self.onvif.action("right", self.get_speed())

	def move_ul_handler(self):
		self.onvif.action("ul", self.get_speed())

	def move_ur_handler(self):
		self.onvif.action("ur", self.get_speed())

	def move_dl_handler(self):
		self.onvif.action("dl", self.get_speed())

	def move_dr_handler(self):
		self.onvif.action("dr", self.get_speed())

	def stop_handler(self):
		self.onvif.action("s", self.get_speed())

	def save_preset(self):
		try:
			text, okPressed = QtWidgets.QInputDialog.getText(
				self, "Preset Name", "Enter Preset Name", QtWidgets.QLineEdit.Normal, "")
			if okPressed:
				self.onvif.action('save', preset=text)
				self.cb_preset.clear()
				self.get_preset()
		except Exception as e:
			print("Preset Save Failure", e)

	def apply_preset(self):
		text = self.cb_preset.currentText()
		preset = list(filter(lambda x: True if text == x[
			0] else False, self.preset_list))[0]
		self.onvif.action('load', preset=preset)

	def get_preset(self):
		try:
			with open('support\\preset.sai', 'r') as file:
				self.preset_list = list(filter(lambda x: True if len(x) == 4 else False,
											   map(lambda x: tuple(x.strip().split(':')), file.readlines())))
			self.cb_preset.addItems(
				list(map(lambda x: x[0], self.preset_list)))
		except Exception as e:
			print("Preset Handling Failure", e)

	def btn_setup_camera_handler(self):
		self.dialog_setup_camera = DialogSetupCamera(self)
		self.dialog_setup_camera.setupUi()
		self.dialog_setup_camera.input_ip.setText(str(self.ip))
		self.dialog_setup_camera.input_port.setText(str(self.port))
		self.dialog_setup_camera.input_uid.setText(str(self.uid))
		self.dialog_setup_camera.input_pwd.setText(str(self.pwd))
		self.dialog_setup_camera.show()

	def dialog_setup_cancel(self):
		self.dialog_setup_camera.reject()

	def dialog_setup_ok(self):
		self.dialog_setup_camera.accept()
		self.init_label.setText("Re-Initializing Camera Control")
		self.btn_setup_camera.hide()
		try:
			self.ip = self.dialog_setup_camera.input_ip.text()
			self.port = self.dialog_setup_camera.input_port.text()
			self.uid = self.dialog_setup_camera.input_uid.text()
			self.pwd = self.dialog_setup_camera.input_pwd.text()
			if len(self.ip) >= 9 and self.ip.find(':') != -1:
				self.ip = self.ip.split(":")[0]
				self.port = int(self.ip.split(":")[1])
		except:
			print("Invalid Input")
		finally:
			if self.ip != '' and len(self.ip) >= 7 and str.isalnum(self.port) and len(self.port) >= 1:
				self.setupController()
			else:
				self.set_onvif_support(False)

	def dialog_setup_reset(self):
		self.dialog_setup_camera.input_ip.setText(str(self.ip))
		self.dialog_setup_camera.input_port.setText(str(self.port))
		self.dialog_setup_camera.input_uid.setText(str(self.uid))
		self.dialog_setup_camera.input_pwd.setText(str(self.pwd))
	#----Onvif Connection Handler----

	def setupUi(self, toggle):
		Form = self
		Form.setObjectName("camForm")
		# Form.resize(650, 220)
		if not self.ui_available:

			# self.setStyleSheet('margin:0;padding:5;')
			self.gridLayout = QtWidgets.QGridLayout(self)
			self.setLayout(self.gridLayout)
			# self.gridLayout.setAlignment(QtCore.Qt.AlignCenter)

			self.gridLayoutInner = QtWidgets.QGridLayout(self)

			# self.hBox = QtWidgets.QHBoxLayout(Form)
			# self.vBox1W = QtWidgets.QWidget(Form)
			# self.vBox1 = QtWidgets.QVBoxLayout(self.vBox1W)
			# self.vBox2W = QtWidgets.QWidget(Form)
			# self.vBox2 = QtWidgets.QVBoxLayout(self.vBox2W)
			# self.vBox3W = QtWidgets.QWidget(Form)
			# self.vBox3 = QtWidgets.QVBoxLayout(self.vBox3W)

			# self.hBox.addStretch()
			# self.vBox1W.setSizePolicy(QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Minimum)
			# self.vBox2W.setSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Preferred)
			# self.vBox3W.setSizePolicy(QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Minimum)
			# self.hBox.addWidget(self.vBox1W)
			# self.hBox.addWidget(self.vBox2W)
			# self.hBox.addWidget(self.vBox3W)
			# self.hBox.addStretch()

			# self.hBox1W = QtWidgets.QWidget(self.vBox2W)
			# self.hBox1 = QtWidgets.QHBoxLayout(self.hBox1W)
			# self.hBox2W = QtWidgets.QWidget(self.vBox2W)
			# self.hBox2 = QtWidgets.QHBoxLayout(self.hBox2W)
			# self.hBox3W = QtWidgets.QWidget(self.vBox2W)
			# self.hBox3 = QtWidgets.QHBoxLayout(self.hBox3W)
			# self.hBox4W = QtWidgets.QWidget(self.vBox2W)
			# self.hBox4 = QtWidgets.QHBoxLayout(self.hBox4W)

			# self.vBox2.addWidget(self.hBox1W)
			# self.vBox2.addWidget(self.hBox2W)
			# self.vBox2.addWidget(self.hBox3W)
			# self.vBox2.addWidget(self.hBox4W)

			self.ui_available = True

			self.init_label = QtWidgets.QLabel(Form)
			# self.init_label.setEnabled(False)
			self.init_label.setStyleSheet(
				"font: 10pt Kalinga ;color: rgb(0,0,0);text-align:center;")
			self.init_label.setObjectName("init_label")

			self.btn_move_left = QtWidgets.QPushButton(Form)
			self.btn_move_left.setObjectName("btn_move_left")

			self.btn_move_up = QtWidgets.QPushButton(Form)
			self.btn_move_up.setObjectName("btn_move_up")

			self.btn_move_right = QtWidgets.QPushButton(Form)
			self.btn_move_right.setObjectName("btn_move_right")

			self.btn_move_down = QtWidgets.QPushButton(Form)
			self.btn_move_down.setObjectName("btn_move_down")

			self.btn_zoom_in = QtWidgets.QPushButton(Form)
			self.btn_zoom_in.setObjectName("btn_zoom_in")

			self.btn_zoom_out = QtWidgets.QPushButton(Form)
			self.btn_zoom_out.setObjectName("btn_zoom_out")

			self.label_zoom = QtWidgets.QLabel(Form)
			self.label_zoom.setObjectName("label_zoom")

			self.label_move = QtWidgets.QLabel(Form)
			self.label_move.setObjectName("label_move")

			self.btn_setup_camera = QtWidgets.QPushButton(Form)
			self.btn_setup_camera.setObjectName("btn_setup_camera")

			self.btn_move_ur = QtWidgets.QPushButton(Form)
			self.btn_move_ur.setObjectName("btn_move_ur")

			self.btn_move_ul = QtWidgets.QPushButton(Form)
			self.btn_move_ul.setObjectName("btn_move_ul")

			self.btn_move_dr = QtWidgets.QPushButton(Form)
			self.btn_move_dr.setObjectName("btn_move_dr")

			self.btn_move_dl = QtWidgets.QPushButton(Form)
			self.btn_move_dl.setObjectName("btn_move_dl")

			self.btn_move_stop = QtWidgets.QPushButton(Form)
			self.btn_move_stop.setStyleSheet("background-color:gray;")
			self.btn_move_stop.setFlat(False)
			self.btn_move_stop.setObjectName("btn_move_stop")

			# self.hBox1.addWidget(self.btn_move_ul)
			# self.hBox1.addWidget(self.btn_move_up)
			# self.hBox1.addWidget(self.btn_move_ur)

			# self.hBox2.addWidget(self.btn_move_left)
			# self.hBox2.addWidget(self.btn_move_stop)
			# self.hBox2.addWidget(self.btn_move_right)

			# self.hBox3.addWidget(self.btn_move_dl)
			# self.hBox3.addWidget(self.btn_move_down)
			# self.hBox3.addWidget(self.btn_move_dr)

			# self.hBox4.addWidget(self.btn_zoom_in)
			# self.hBox4.addWidget(self.btn_zoom_out)

			self.slider_zoom = QtWidgets.QSlider(Form)
			self.slider_zoom.setMinimum(1)
			self.slider_zoom.setMaximum(10)
			self.slider_zoom.setPageStep(2)
			self.slider_zoom.setProperty("value", 5)
			self.slider_zoom.setOrientation(QtCore.Qt.Horizontal)
			self.slider_zoom.setObjectName("slider_zoom")

			self.slider_move = QtWidgets.QSlider(Form)
			self.slider_move.setMinimum(1)
			self.slider_move.setMaximum(10)
			self.slider_move.setPageStep(2)
			self.slider_move.setProperty("value", 5)
			self.slider_move.setOrientation(QtCore.Qt.Horizontal)
			self.slider_move.setObjectName("slider_move")

			self.cb_preset = QtWidgets.QComboBox(Form)
			self.cb_preset.setObjectName("cb_preset")

			self.label_preset = QtWidgets.QLabel(Form)
			self.label_preset.setObjectName("label_preset")

			self.btn_apply_preset = QtWidgets.QPushButton(Form)
			self.btn_apply_preset.setObjectName("btn_apply_preset")

			self.btn_save_preset = QtWidgets.QPushButton(Form)
			self.btn_save_preset.setObjectName("btn_save_preset")

			self.gridLayout.addWidget(self.btn_setup_camera,0,0,1,1)
			self.gridLayout.addWidget(self.label_zoom,1,0,1,1)
			self.gridLayout.addWidget(self.slider_zoom,2,0,1,1)
			self.gridLayout.addWidget(self.label_move,3,0,1,1)
			self.gridLayout.addWidget(self.slider_move,4,0,1,1)

			self.gridLayout.addLayout(self.gridLayoutInner,0,1,5,1)
			self.gridLayout.addWidget(self.label_preset,0,2,1,1)
			self.gridLayout.addWidget(self.cb_preset,1,2,1,1)
			self.gridLayout.addWidget(self.btn_apply_preset,2,2,1,1)
			self.gridLayout.addWidget(self.btn_save_preset,3,2,1,1)

			self.gridLayoutInner.addWidget(self.btn_move_ul,0,0,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_up,0,1,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_ur,0,2,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_left,1,0,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_stop,1,1,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_right,1,2,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_dl,2,0,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_down,2,1,1,1)
			self.gridLayoutInner.addWidget(self.btn_move_dr,2,2,1,1)
			self.gridLayoutInner.addWidget(self.btn_zoom_in,4,0,1,1)
			self.gridLayoutInner.addWidget(self.btn_zoom_out,4,2,1,1)

			self.gridLayout.setColumnStretch(0,1)
			self.gridLayout.setColumnStretch(1,3)
			self.gridLayout.setColumnStretch(2,1)

			self.setLayout(self.gridLayout)
			# self.vBox1.addWidget(self.btn_setup_camera)
			# self.vBox1.addWidget(self.label_zoom)
			# self.vBox1.addWidget(self.slider_zoom)
			# self.vBox1.addWidget(self.label_move)
			# self.vBox1.addWidget(self.slider_move)

			# self.vBox3.addWidget(self.label_preset)
			# self.vBox3.addWidget(self.cb_preset)
			# self.vBox3.addWidget(self.btn_apply_preset)
			# self.vBox3.addWidget(self.btn_save_preset)

			# self.hBox.setStretch(1,1)
			# self.hBox.setStretch(2,2)
			# self.hBox.setStretch(3,1)
			# self.setLayout(self.hBox)

			# Listeners here (Control Handlers)
			self.btn_move_down.clicked.connect(self.move_down_handler)
			self.btn_move_up.clicked.connect(self.move_up_handler)
			self.btn_move_left.clicked.connect(self.move_left_handler)
			self.btn_move_ul.clicked.connect(self.move_ul_handler)
			self.btn_move_ur.clicked.connect(self.move_ur_handler)
			self.btn_move_dl.clicked.connect(self.move_dl_handler)
			self.btn_move_dr.clicked.connect(self.move_dr_handler)
			self.btn_move_right.clicked.connect(self.move_right_handler)
			self.btn_zoom_in.clicked.connect(self.zoom_in_handler)
			self.btn_zoom_out.clicked.connect(self.zoom_out_handler)
			self.btn_move_stop.clicked.connect(self.stop_handler)
			self.btn_apply_preset.clicked.connect(self.apply_preset)
			self.btn_save_preset.clicked.connect(self.save_preset)
			self.btn_setup_camera.clicked.connect(self.btn_setup_camera_handler)

			self.retranslateUi(Form, toggle)
			QtCore.QMetaObject.connectSlotsByName(Form)
		if not toggle:
			self.btn_move_up.hide()
			self.btn_move_left.hide()
			self.btn_move_up.hide()
			self.btn_move_right.hide()
			self.btn_move_down.hide()
			self.btn_zoom_in.hide()
			self.btn_zoom_out.hide()
			self.label_zoom.hide()
			self.label_move.hide()
			# self.btn_setup_control.hide()
			self.btn_setup_camera.hide()
			self.btn_move_ur.hide()
			self.btn_move_ul.hide()
			self.btn_move_dr.hide()
			self.btn_move_dl.hide()
			self.btn_move_stop.hide()
			self.slider_zoom.hide()
			self.slider_zoom.hide()
			self.slider_move.hide()
			self.cb_preset.hide()
			self.btn_save_preset.hide()
			self.label_preset.hide()
			self.btn_apply_preset.hide()
		else:
			self.get_preset()
			self.btn_move_up.show()
			self.btn_move_left.show()
			self.btn_move_up.show()
			self.btn_move_right.show()
			self.btn_move_down.show()
			self.btn_zoom_in.show()
			self.btn_zoom_out.show()
			self.label_zoom.show()
			self.label_move.show()
			# self.btn_setup_control.show()
			self.btn_setup_camera.show()
			self.btn_move_ur.show()
			self.btn_move_ul.show()
			self.btn_move_dr.show()
			self.btn_move_dl.show()
			self.btn_move_stop.show()
			self.slider_zoom.show()
			self.slider_zoom.show()
			self.slider_move.show()
			self.cb_preset.show()
			self.btn_save_preset.show()
			self.label_preset.show()
			self.btn_apply_preset.show()

	def retranslateUi(self, Form, toggle):
		_translate = QtCore.QCoreApplication.translate
		Form.setWindowTitle(_translate("camForm", "camForm"))
		self.init_label.setText(_translate("camForm", ""))
		self.btn_move_left.setText(_translate("camForm", "Left"))
		self.btn_move_up.setText(_translate("camForm", "Up"))
		self.btn_move_right.setText(_translate("camForm", "Right"))
		self.btn_move_down.setText(_translate("camForm", "Down"))
		self.btn_zoom_in.setText(_translate("camForm", "Zoom In"))
		self.btn_zoom_out.setText(_translate("camForm", "Zoom out"))
		self.label_zoom.setText(_translate("camForm", "Speed : "))
		self.label_move.setText(_translate("camForm", "Depth : "))
		# self.btn_setup_control.setText(_translate("camForm", "Setup Controls"))
		self.btn_setup_camera.setText(_translate("camForm", "Setup Camera"))
		self.btn_move_ur.setText(_translate("camForm", "UR"))
		self.btn_move_ul.setText(_translate("camForm", "UL"))
		self.btn_move_dr.setText(_translate("camForm", "DR"))
		self.btn_move_dl.setText(_translate("camForm", "DL"))
		self.btn_move_stop.setText(_translate("camForm", "Stop"))
		self.label_preset.setText(_translate("camForm", "Select Preset :"))
		self.btn_apply_preset.setText(
			_translate("camForm", "Apply selected preset"))
		self.btn_save_preset.setText(
			_translate("camForm", "Save current preset"))
