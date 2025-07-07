Get-Content .env | foreach {
    $name, $value = $_.split('=')
    Set-Content env:\$name $value
}