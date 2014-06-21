<?php
// Minecraft Server Status Checker V2.0
//
// Copyright (c) 2014 Jeremy Lam (JLChnToZ)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// ---------------------------------------------------------------
// Don't suck with the error reporting
error_reporting(0);
// require the mcstat.php
require_once './mcstat.php';
// Tell the browser this is a dynamic JSON file.
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Sat, 01 Jan 2000 00:00:00 GMT');
header('Content-type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
// Parse the request
$request = array();
if(sizeof($_GET) > 0) {
  if(isset($_GET['mode'])) $request = array($_GET['mode']);
  else $request = array();
  array_unshift($request, array());
  $request[0][0] = $_GET['host'];
  if(isset($_GET['port'])) $request[0][1] = $_GET['port'];
} else {
  $request = substr($_SERVER['REQUEST_URI'], strlen($_SERVER['SCRIPT_NAME']));
  if(strpos($request, "/") === 0) $request = substr($request, 1);
  $request  = explode("/", $request);
  $request[0]  = explode(":", $request[0]);
}
if(sizeof($request[0]) < 2) $request[0][1] = 25565; // Default port = 25565
if(sizeof($request) < 1) $request[1] = 'legacy_ping'; // Default request = legacy ping
// Construct
$mcs = new MinecraftStatus($request[0][0], $request[0][1]);
// Try to communicate with the server with each request type until the result is given
$errr = '';
try {
  switch(strtolower($request[1])) {
    case 'ping': $data = $mcs->ping(false); break;
    case 'legacy_ping': $data = $mcs->ping(true); break;
    case 'basic_query': $data = $mcs->query(false); break;
    case 'full_query': $data = $mcs->query(true); break;
  }
} catch(Exception $e) {
  $errr = $e -> getMessage();
}
if(!isset($data) || sizeof($data) < 1)
  $data = array('err' => $errr);
// Dat'z all, bye bye!
echo json_encode($data);
?>