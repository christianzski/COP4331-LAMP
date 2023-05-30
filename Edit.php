<?php
	$inData = getRequestInfo();
	
	$UserID= $inData["UserID"];
	$ID = $inData["ID"];
	$updateField = ["EditField"];
	$updateValue = ["EditValue"];

		
	{
		$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
		if ($conn->connect_error) 
		{
			returnWithError( $conn->connect_error );
		} 
		else
		{
			$stmt = $conn->prepare("update Contacts set $updateField[0] = ? where (UserID = ? and ID = ?)");
			$stmt->bind_param('sii', $updateValue, $UserID, $ID);
			$stmt->execute();
			$stmt->close();
			$conn->close();
			returnWithError("");
		}
	}
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
	
?>