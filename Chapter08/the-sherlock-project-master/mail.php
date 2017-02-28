<?php
var_dump($_POST);die;
  header('Content-type: application/json');

	$from_email = 'app@app.com';
	$message = $_POST['message'];
	$to_email = 'sohail2d@gmail.com';

	$email_subject = "Neue Nachricht von $from_name erhalten";
	$headers .= "From: $from_email\n";
	$headers .= "Reply-To: $from_email";

	if(mail($to_email,$email_subject,$message,$headers)==true) {
    $response_array['status'] = 'success';
  } else {
    $response_array['status'] = 'error';
  }
  echo json_encode($response_array);
?>
