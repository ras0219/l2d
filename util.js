function removeItemFromArray( A, pred ) {
    var loc = -1;
    for(var i=0;i<A.length;i++)
    {
        if( pred(A[i]) )
            loc = i;
    }

    if( loc >= 0 )
    {
        A.splice(loc, 1);
    }
}
