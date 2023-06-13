<?php

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
		exit();
	}

	$inData = getRequestInfo();

	$userLogin = $inData["userLogin"];
	$userPass = $inData["userPass"];

	passwordReqirements($userPass);

	if(userExists($userLogin, $conn))
	{
		exit();
	}
		
	

	$stmt = $conn->prepare("insert into Users (FirstName,LastName,Login,Password) VALUES(?, ?, ?, ?)");
	$stmt->bind_param('ssss', $inData["firstName"], $inData["lastName"], $userLogin, $userPass);
	$stmt->execute();
	$stmt->close();
	$conn->close();
	returnWithInfo("User Created.");
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function userExists( $userID, $conn )
	{
		$stmt=$conn->prepare("select * from Users where Login=?");
		$stmt->bind_param("s", $userID);
		$stmt->execute();
		$res = $stmt->get_result();
		$num = mysqli_num_rows($res);
		if($num > 0) {
			returnWithError("User aready exists.");
			return true;
		}
		else {return false;}
	}

	function returnWithInfo( $val )
	{
		$retValue = '{"Status":"' . $val . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function passwordReqirements ($password) {
		$uppercase = preg_match('@[A-Z]@', $password);
		$lowercase = preg_match('@[a-z]@', $password);
		$number = preg_match('@[0-9]@', $password);
		$specialChars = preg_match('@[^\w]@', $password);

		if($uppercase && $lowercase && $number && $specialChars && strlen($password) >= 8 && strlen($password) <= 16) {
			return true;
		}
		else{
			if(!$uppercase)
				returnWithError("Password must contain at least 1 capital letter.");
			if(!$lowercase)
				returnWithError("Password must contain at least 1 lowercase letter.");
			if(!$number)
				returnWithError("Password must contain at least 1 number.");
			if(!$specialChars)
				returnWithError("Password must contain at least 1 special character.");
			if(strlen($password)<8)
				returnWithError("Password must contain between 8-16 characters.");
			exit();
		}
	}
	
?>