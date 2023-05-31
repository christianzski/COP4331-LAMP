<?php

	$inData = getRequestInfo();

	$searchResults = "";
	$searchCount = 0;
    $idCheck = 0;

	$conn = new mysqli("localhost", "Group21", "Group21OnTop", "COP4331");

	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
	    $idCheck = validUser($conn);
	    if($idCheck == 0){
	        returnWithError( "User not valid within cookie" );
	    }

		$stmt = $conn->prepare("select * from Contacts where (FirstName like ? or LastName like ?) and UserID=?");
		$searchName = "%" . $inData["search"] . "%";
		$stmt->bind_param("ssi", $searchName, $searchName, $idCheck);
		$stmt->execute();

		$result = $stmt->get_result();

		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;

			$searchResults .= '{"ID" : "' . $row["ID"] . '",
				"FirstName" : "' . $row["FirstName"] . '",
				"LastName" : "' . $row["LastName"] . '",
				"Phone" : "' . $row["Phone"] . '",
				"Email" : "' . $row["Email"] .	'",
				"UserID" : "' . $row["UserID"].  '"}';
		}

		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}

		$stmt->close();
		$conn->close();
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}

	function validUser($conn) //todo here ---> login = PoonP, password = testing
	{
	    $stmt = $conn->prepare("SELECT ID,firstName,lastName FROM Users WHERE Login=? AND Password =?");
        $stmt->bind_param("ss", $_COOKIE["login"], $_COOKIE["password"]);
        $stmt->execute();
        $result = $stmt->get_result();

        if( $row = $result->fetch_assoc()  )
        {
            $idCheck = $row['ID'];
        }

        return $idCheck;
	}

?>