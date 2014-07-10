<?php
$username = $_GET['username'];
$paths = array(
  "http://s3.amazonaws.com/MinecraftSkins/$username.png",
  // You can add your own skin source URL here similar as skin mods.
  'images/steve.png'
);
foreach($paths as $path) {
  $type = pathinfo($path, PATHINFO_EXTENSION);
  $data = @file_get_contents($path);
  if($data !== false && strpos($data, 'AccessDenied') === false) break;
}
echo 'data:image/'.$type.';base64,'.base64_encode($data);
?>